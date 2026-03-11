from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta
from ..core.database import get_db
from ..models.presence_log import PresenceLog
from ..models.person import Person
from ..models.camera import Camera
from ..schemas.presence_log import PresenceLogCreate, PresenceLogResponse, PresenceLogWithDetails

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("/", response_model=List[PresenceLogWithDetails])
def list_logs(
    skip: int = 0,
    limit: int = 100,
    person_id: Optional[int] = None,
    camera_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(
        PresenceLog,
        Person.name.label("person_name"),
        Camera.name.label("camera_name"),
        Camera.location.label("camera_location")
    ).join(Person).join(Camera)
    
    if person_id:
        query = query.filter(PresenceLog.person_id == person_id)
    if camera_id:
        query = query.filter(PresenceLog.camera_id == camera_id)
    if start_date:
        query = query.filter(PresenceLog.detected_at >= start_date)
    if end_date:
        query = query.filter(PresenceLog.detected_at <= end_date)
    
    results = query.order_by(desc(PresenceLog.detected_at)).offset(skip).limit(limit).all()
    
    logs = []
    for log, person_name, camera_name, camera_location in results:
        log_dict = {
            "id": log.id,
            "person_id": log.person_id,
            "camera_id": log.camera_id,
            "detected_at": log.detected_at,
            "confidence_score": log.confidence_score,
            "is_spoofing_detected": log.is_spoofing_detected,
            "image_path": log.image_path,
            "metadata": log.metadata,
            "person_name": person_name,
            "camera_name": camera_name,
            "camera_location": camera_location
        }
        logs.append(log_dict)
    
    return logs

@router.get("/{log_id}", response_model=PresenceLogResponse)
def get_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(PresenceLog).filter(PresenceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log

@router.post("/", response_model=PresenceLogResponse, status_code=status.HTTP_201_CREATED)
def create_log(log: PresenceLogCreate, db: Session = Depends(get_db)):
    # Verify person exists
    person = db.query(Person).filter(Person.id == log.person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    # Verify camera exists
    camera = db.query(Camera).filter(Camera.id == log.camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    db_log = PresenceLog(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/stats/daily")
def get_daily_stats(
    date: Optional[datetime] = Query(default=None),
    db: Session = Depends(get_db)
):
    if not date:
        date = datetime.utcnow().date()
    
    start_of_day = datetime.combine(date, datetime.min.time())
    end_of_day = datetime.combine(date, datetime.max.time())
    
    total_detections = db.query(PresenceLog).filter(
        PresenceLog.detected_at >= start_of_day,
        PresenceLog.detected_at <= end_of_day
    ).count()
    
    unique_persons = db.query(PresenceLog.person_id).filter(
        PresenceLog.detected_at >= start_of_day,
        PresenceLog.detected_at <= end_of_day
    ).distinct().count()
    
    spoofing_attempts = db.query(PresenceLog).filter(
        PresenceLog.detected_at >= start_of_day,
        PresenceLog.detected_at <= end_of_day,
        PresenceLog.is_spoofing_detected == True
    ).count()
    
    return {
        "date": date,
        "total_detections": total_detections,
        "unique_persons": unique_persons,
        "spoofing_attempts": spoofing_attempts
    }
