from enum import Enum
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class LLMProviderType(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    OLLAMA = "ollama"
    LOCAL = "local"
    NONE = "none"


class LLMSettings(BaseSettings):
    LLM_PROVIDER: LLMProviderType = LLMProviderType.NONE
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o"
    LLM_TIMEOUT: float = 30.0
    LLM_BASE_URL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


llm_settings = LLMSettings()
