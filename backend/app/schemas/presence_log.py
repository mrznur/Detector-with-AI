from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PresenceLogBase(BaseModel):
    person_id: int
    camera_id: int
    confidence_score: float
    is_spoofing_detected: bool = False
    image_path: Optional[str] = None
    extra_data: Optional[str] = None

class PresenceLogCreate(PresenceLogBase):
    pass

class PresenceLogResponse(PresenceLogBase):
    id: int
    detected_at: datetime
    
    class Config:
        from_attributes = True

class PresenceLogWithDetails(PresenceLogResponse):
    person_name: Optional[str] = None
    camera_name: Optional[str] = None
    camera_location: Optional[str] = None
