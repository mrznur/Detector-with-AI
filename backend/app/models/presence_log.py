from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class PresenceLog(Base):
    __tablename__ = "presence_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False, index=True)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    confidence_score = Column(Float, nullable=False)
    is_spoofing_detected = Column(Boolean, default=False)
    image_path = Column(String, nullable=True)
    extra_data = Column(String, nullable=True)  # JSON string for additional data
    
    # Relationships
    person = relationship("Person", back_populates="presence_logs")
    camera = relationship("Camera", back_populates="presence_logs")
