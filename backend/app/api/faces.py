from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import numpy as np
from deepface import DeepFace
from ..core.database import get_db
from ..core.face_config import face_config
from ..models.person import Person
from ..models.face_embedding import FaceEmbedding
from ..services.face_service import face_service
from ..services.gesture_service import gesture_service

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
    """Upload a photo and verify if it matches any enrolled person (supports multiple faces + motion detection)"""
    
    # Save uploaded image temporarily
    temp_path = UPLOAD_DIR / f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Convert image format if needed
        converted_path = face_service.convert_heic_to_jpg(str(temp_path))
        
        # Detect motion
        motion_data = gesture_service.detect_motion(converted_path)
        
        # Try to detect multiple faces using DeepFace
        try:
            all_faces = DeepFace.represent(
                img_path=converted_path,
                model_name=face_config.MODEL_NAME,
                detector_backend=face_config.DETECTOR_BACKEND,
                enforce_detection=False,  # Don't fail if no face
                align=face_config.ALIGN_FACES
            )
        except Exception as e:
            temp_path.unlink(missing_ok=True)
            if converted_path != str(temp_path):
                Path(converted_path).unlink(missing_ok=True)
            return {
                "match": False,
                "message": "No face detected in image",
                "faces_detected": 0,
                "motion": motion_data
            }
        
        # Get all enrolled face embeddings
        all_embeddings = db.query(FaceEmbedding).all()
        
        if not all_embeddings:
            temp_path.unlink(missing_ok=True)
            if converted_path != str(temp_path):
                Path(converted_path).unlink(missing_ok=True)
            return {
                "match": False,
                "message": "No enrolled faces in database",
                "faces_detected": len(all_faces),
                "motion": motion_data
            }
        
        threshold = face_config.VERIFICATION_THRESHOLD
        detected_persons = []
        
        # Process each detected face
        for face_data in all_faces:
            test_embedding = np.array(face_data["embedding"])
            
            best_match = None
            best_similarity = 0.0
            
            # Compare with all enrolled faces
            for db_embedding in all_embeddings:
                stored_embedding = face_service.deserialize_embedding(db_embedding.embedding)
                similarity = face_service.compare_faces(test_embedding, stored_embedding)
                
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = db_embedding
            
            # Check if match is good enough
            if best_similarity >= threshold and best_match:
                person = db.query(Person).filter(Person.id == best_match.person_id).first()
                detected_persons.append({
                    "person_id": person.id,
                    "person_name": person.name,
                    "confidence": round(best_similarity * 100, 2)
                })
            else:
                # Unknown person
                if best_match:
                    person = db.query(Person).filter(Person.id == best_match.person_id).first()
                    detected_persons.append({
                        "person_id": None,
                        "person_name": "Unknown",
                        "confidence": round(best_similarity * 100, 2),
                        "closest_match": {
                            "person_id": person.id,
                            "person_name": person.name,
                            "confidence": round(best_similarity * 100, 2)
                        }
                    })
                else:
                    detected_persons.append({
                        "person_id": None,
                        "person_name": "Unknown",
                        "confidence": 0.0
                    })
        
        # Clean up temp files
        temp_path.unlink(missing_ok=True)
        if converted_path != str(temp_path):
            Path(converted_path).unlink(missing_ok=True)
        
        # Return results
        if len(detected_persons) == 1:
            # Single face - return old format for compatibility
            person_data = detected_persons[0]
            if person_data["person_id"]:
                return {
                    "match": True,
                    "person_id": person_data["person_id"],
                    "person_name": person_data["person_name"],
                    "confidence": person_data["confidence"],
                    "message": f"Matched with {person_data['person_name']}",
                    "faces_detected": 1,
                    "motion": motion_data
                }
            else:
                result = {
                    "match": False,
                    "confidence": person_data["confidence"],
                    "message": "Unknown person",
                    "faces_detected": 1,
                    "motion": motion_data
                }
                if "closest_match" in person_data:
                    result["closest_match"] = person_data["closest_match"]
                return result
        else:
            # Multiple faces
            return {
                "match": any(p["person_id"] for p in detected_persons),
                "message": f"Detected {len(detected_persons)} face(s)",
                "faces_detected": len(detected_persons),
                "persons": detected_persons,
                "motion": motion_data
            }
    
    except Exception as e:
        # Clean up temp file
        temp_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(e))
