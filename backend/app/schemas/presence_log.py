from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PresenceLogBase(BaseModel):
    person_id: int
    camera_id: Optional[int] = None
    confidence_score: float

class PresenceLogCreate(PresenceLogBase):
    pass

class PresenceLogResponse(PresenceLogBase):
    id: int
    detected_at: datetime

    class Config:
        from_attributes = True
