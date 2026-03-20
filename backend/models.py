from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProposalRequest(BaseModel):
    prompt: str = Field(min_length=10, max_length=1000)
    user_id: str = Field(min_length=3, max_length=128)
    session_id: str = Field(min_length=3, max_length=128)


class VenueProposal(BaseModel):
    venue_name: str
    location: str
    estimated_cost: str
    why_it_fits: str


class ProposalRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    user_id: str
    session_id: str
    request: str
    proposal: VenueProposal
    created_at: datetime