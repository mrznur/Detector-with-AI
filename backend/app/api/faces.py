from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
from ..core.database import get_db
from ..core.face_config import face_config
from ..models.person import Person
from ..models.face_embedding import FaceEmbedding
from ..services.face_service import face_service

router = APIRouter(prefix="/faces", tags=["faces"])

UPLOAD_DIR = Path("uploads/faces")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/enroll/{person_id}")
async def enroll_face(
    person_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a face image and create embedding for a person"""
    
    # Check if person exists
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    # Save uploaded image
    file_path = UPLOAD_DIR / f"{person_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Extract face embedding
        embedding = face_service.extract_embedding(str(file_path))
        
        # Serialize and save to database
        embedding_bytes = face_service.serialize_embedding(embedding)
        
        db_embedding = FaceEmbedding(
            person_id=person_id,
            embedding=embedding_bytes,
            is_primary=True
        )
        db.add(db_embedding)
        db.commit()
        
        return {
            "message": "Face enrolled successfully",
            "person_id": person_id,
            "person_name": person.name,
            "embedding_id": db_embedding.id
        }
    
    except Exception as e:
        # Clean up file if embedding extraction fails
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/person/{person_id}/embeddings")
def get_person_embeddings(person_id: int, db: Session = Depends(get_db)):
    """Get all face embeddings for a person"""
    embeddings = db.query(FaceEmbedding).filter(
        FaceEmbedding.person_id == person_id
    ).all()
    
    return {
        "person_id": person_id,
        "embedding_count": len(embeddings),
        "embeddings": [{"id": e.id, "created_at": e.created_at} for e in embeddings]
    }


@router.post("/verify")
async def verify_face(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a photo and verify if it matches any enrolled person"""
    
    # Save uploaded image temporarily
    temp_path = UPLOAD_DIR / f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Extract embedding from uploaded photo
        test_embedding = face_service.extract_embedding(str(temp_path))
        
        # Get all enrolled face embeddings
        all_embeddings = db.query(FaceEmbedding).all()
        
        if not all_embeddings:
            return {
                "match": False,
                "message": "No enrolled faces in database"
            }
        
        # Compare with all enrolled faces
        best_match = None
        best_similarity = 0.0
        threshold = face_config.VERIFICATION_THRESHOLD  # Use config threshold
        
        for db_embedding in all_embeddings:
            stored_embedding = face_service.deserialize_embedding(db_embedding.embedding)
            similarity = face_service.compare_faces(test_embedding, stored_embedding)
            
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = db_embedding
        
        # Clean up temp file
        temp_path.unlink(missing_ok=True)
        
        # Check if match is good enough
        if best_similarity >= threshold:
            person = db.query(Person).filter(Person.id == best_match.person_id).first()
            return {
                "match": True,
                "person_id": person.id,
                "person_name": person.name,
                "confidence": round(best_similarity * 100, 2),
                "message": f"Matched with {person.name}"
            }
        else:
            # Unknown, but show closest match
            if best_match:
                person = db.query(Person).filter(Person.id == best_match.person_id).first()
                return {
                    "match": False,
                    "confidence": round(best_similarity * 100, 2),
                    "message": "Unknown person",
                    "closest_match": {
                        "person_id": person.id,
                        "person_name": person.name,
                        "confidence": round(best_similarity * 100, 2)
                    }
                }
            else:
                return {
                    "match": False,
                    "confidence": 0.0,
                    "message": "Unknown person"
                }
    
    except Exception as e:
        # Clean up temp file
        temp_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(e))
