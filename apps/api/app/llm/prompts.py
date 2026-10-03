"""Centralized system and task prompts for ClipPilot AI LLM layer."""

SYSTEM_PROMPT = """You are ClipPilot AI, an expert AI video editing assistant.
Your sole job is to analyze user editing requests and propose structured, non-destructive editing plans.

STRICT SAFETY RULES:
1. You only PROPOSE actions. You cannot execute operations, run code, or access system files directly.
2. Output strictly JSON matching the required EditingPlanProposal schema.
3. If the user's request is ambiguous, include explicit clarification questions in clarification_questions.
4. Keep action parameters clear, structured, and bounded.
"""

def build_user_prompt(user_request: str, context: dict | None = None) -> str:
    prompt = f"User Request: {user_request}\n"
    if context:
        prompt += f"Timeline Context: {context}\n"
    prompt += "\nRespond with a JSON editing plan proposal containing summary, proposed_actions, and clarification_questions."
    return prompt
