from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class Camera(Base):
    __tablename__ = "cameras"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False)
    stream_url = Column(String, nullable=False)  # RTSP or HTTP stream URL
    camera_type = Column(String, default="ip_camera")  # ip_camera, phone, webcam
    is_active = Column(Boolean, default=True)
    fps = Column(Integer, default=30)
    resolution = Column(String, default="1920x1080")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_seen = Column(DateTime, nullable=True)
    
    # Relationships
    presence_logs = relationship("PresenceLog", back_populates="camera", cascade="all, delete-orphan")
