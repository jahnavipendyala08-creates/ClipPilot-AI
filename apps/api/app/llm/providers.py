from abc import ABC, abstractmethod
import json
from typing import Any, Dict

import httpx
from pydantic import ValidationError

from app.llm.config import LLMProviderType, LLMSettings
from app.llm.prompts import SYSTEM_PROMPT, build_user_prompt
from app.llm.structured import EditingPlanProposal


class LLMError(Exception):
    """Base exception for LLM errors."""
    pass


class LLMConfigurationError(LLMError):
    """Raised when LLM provider configuration or credentials are missing."""
    pass


class LLMTimeoutError(LLMError):
    """Raised when an LLM provider request times out."""
    pass


class LLMProviderError(LLMError):
    """Raised when an LLM provider returns an upstream API error."""
    pass


class LLMValidationError(LLMError):
    """Raised when LLM output fails schema validation."""
    pass


class BaseLLMProvider(ABC):
    """Abstract interface for LLM model providers."""

    @abstractmethod
    async def generate_plan(
        self, user_request: str, context: Dict[str, Any] | None = None
    ) -> EditingPlanProposal:
        """Generate a validated editing plan proposal from user request."""
        pass


class UnconfiguredLLMProvider(BaseLLMProvider):
    """Provider adapter used when no LLM provider is configured."""

    async def generate_plan(
        self, user_request: str, context: Dict[str, Any] | None = None
    ) -> EditingPlanProposal:
        raise LLMConfigurationError(
            "LLM provider is not configured. Please select an LLM provider and configure valid API credentials."
        )


class GenericHTTPLLMProvider(BaseLLMProvider):
    """Generic async HTTP adapter for OpenAI-compatible LLM endpoints."""

    def __init__(self, settings: LLMSettings):
        self.provider = settings.LLM_PROVIDER
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        self.timeout = settings.LLM_TIMEOUT
        self.base_url = (
            settings.LLM_BASE_URL
            or ("https://api.openai.com/v1" if self.provider == LLMProviderType.OPENAI else "http://localhost:11434/v1")
        )

        if not self.api_key and self.provider == LLMProviderType.OPENAI:
            raise LLMConfigurationError(
                "OpenAI API key is missing. Set LLM_API_KEY environment variable."
            )

    async def generate_plan(
        self, user_request: str, context: Dict[str, Any] | None = None
    ) -> EditingPlanProposal:
        prompt = build_user_prompt(user_request, context)
        headers = {
            "Content-Type": "application/json",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url.rstrip('/')}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                raw_content = data["choices"][0]["message"]["content"]
                parsed_json = json.loads(raw_content)
                return EditingPlanProposal.model_validate(parsed_json)

        except httpx.TimeoutException as exc:
            raise LLMTimeoutError("LLM request timed out") from exc
        except httpx.HTTPStatusError as exc:
            raise LLMProviderError(f"LLM provider error (status {exc.response.status_code})") from exc
        except (json.JSONDecodeError, ValidationError, KeyError) as exc:
            raise LLMValidationError("Model output failed schema validation") from exc
        except Exception as exc:
            raise LLMProviderError("Unexpected LLM provider error") from exc


def get_provider(settings: LLMSettings) -> BaseLLMProvider:
    """Factory to retrieve configured LLM provider instance."""
    if settings.LLM_PROVIDER in (LLMProviderType.NONE, None):
        return UnconfiguredLLMProvider()
    elif settings.LLM_PROVIDER in (LLMProviderType.OPENAI, LLMProviderType.OLLAMA, LLMProviderType.LOCAL):
        return GenericHTTPLLMProvider(settings)
    else:
        return UnconfiguredLLMProvider()
