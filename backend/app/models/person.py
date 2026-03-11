from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class Person(Base):
    __tablename__ = "persons"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)  # Male, Female, Other
    employee_id = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    face_embeddings = relationship("FaceEmbedding", back_populates="person", cascade="all, delete-orphan")
    presence_logs = relationship("PresenceLog", back_populates="person", cascade="all, delete-orphan")
