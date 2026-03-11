from sqlalchemy import Column, Integer, ForeignKey, LargeBinary, DateTime, String, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"
    
    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False, index=True)
    embedding = Column(LargeBinary, nullable=False)  # Numpy array stored as binary
    embedding_version = Column(String, default="v1")  # Track model version
    created_at = Column(DateTime, default=datetime.utcnow)
    is_primary = Column(Boolean, default=False)  # Main embedding for this person
    
    # Relationships
    person = relationship("Person", back_populates="face_embeddings")
