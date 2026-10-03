from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class ProposedAction(BaseModel):
    """Represents a single proposed editing operation."""
    action_type: str = Field(
        ...,
        description="The type of edit action (e.g., trim, split, add_transition, adjust_audio, apply_filter)",
    )
    target: str = Field(
        ...,
        description="Target element or media clip (e.g., clip_1, main_video_track, audio_track_1)",
    )
    parameters: Dict[str, Any] = Field(
        default_factory=dict,
        description="Parameters required for the operation (e.g., start_time, duration, transition_type)",
    )
    explanation: str = Field(
        ...,
        description="Human-readable explanation of why this action is proposed",
    )


class EditingPlanProposal(BaseModel):
    """Untrusted model proposal representing a structured editing plan."""
    summary: str = Field(
        ...,
        description="Short summary of the requested edit",
    )
    proposed_actions: List[ProposedAction] = Field(
        default_factory=list,
        description="List of proposed editing actions to execute upon approval",
    )
    requires_user_approval: bool = Field(
        default=True,
        description="Always True: Model output requires explicit user approval before execution",
    )
    clarification_questions: List[str] = Field(
        default_factory=list,
        description="Clarification questions if the user request is ambiguous",
    )


class PlanRequest(BaseModel):
    """User request for generating an editing plan."""
    user_request: str = Field(
        ...,
        description="Natural language instruction for video editing",
    )
    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional timeline or media context metadata",
    )

    @field_validator("user_request")
    @classmethod
    def validate_user_request(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("user_request must not be empty or whitespace only")
        if len(stripped) > 2000:
            raise ValueError("user_request exceeds maximum length of 2000 characters")
        return stripped
