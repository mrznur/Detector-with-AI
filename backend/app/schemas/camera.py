from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CameraBase(BaseModel):
    name: str
    location: str
    stream_url: str
    camera_type: str = "ip_camera"
    fps: int = 30
    resolution: str = "1920x1080"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    stream_url: Optional[str] = None
    camera_type: Optional[str] = None
    is_active: Optional[bool] = None
    fps: Optional[int] = None
    resolution: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CameraResponse(CameraBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_seen: Optional[datetime] = None
    
    class Config:
        from_attributes = True
