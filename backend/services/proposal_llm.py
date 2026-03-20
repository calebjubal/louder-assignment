from __future__ import annotations

from pydantic import BaseModel, Field
from langchain_groq import ChatGroq


class LlmProposalOutput(BaseModel):
    reasoning: str = Field(
        description="A short reasoning summary (2-4 sentences) about why the proposed venue is a fit."
    )
    venue_name: str
    location: str
    estimated_cost: str
    why_it_fits: str


class ProposalLlmService:
    def __init__(self, api_key: str, model_name: str) -> None:
        self._llm = ChatGroq(
            api_key=api_key,
            model=model_name,
            temperature=0.2,
        )

    async def generate(self, prompt: str) -> LlmProposalOutput:
        structured_llm = self._llm.with_structured_output(LlmProposalOutput)
        return await structured_llm.ainvoke(
            [
                (
                    "system",
                    "You are an event planning assistant. Return realistic corporate offsite venue proposals in valid structured output.",
                ),
                (
                    "human",
                    (
                        "Generate one proposal for this event request:\n"
                        f"{prompt}\n\n"
                        "Use these rules:\n"
                        "- estimated_cost should be a concise USD string like $4,800\n"
                        "- why_it_fits should be business-focused and practical\n"
                        "- reasoning should be concise and not exceed 4 sentences"
                    ),
                ),
            ]
        )
