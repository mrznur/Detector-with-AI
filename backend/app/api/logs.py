from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
from ..core.database import get_db
from ..models.presence_log import PresenceLog
from ..models.person import Person
from ..schemas.presence_log import PresenceLogCreate, PresenceLogResponse

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("/")
def list_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    results = (
        db.query(PresenceLog, Person.name.label("person_name"))
        .join(Person, PresenceLog.person_id == Person.id)
        .order_by(desc(PresenceLog.detected_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": log.id,
            "person_id": log.person_id,
            "person_name": person_name,
            "camera_id": log.camera_id,
            "detected_at": log.detected_at,
            "confidence_score": log.confidence_score,
        }
        for log, person_name in results
    ]

@router.get("/{log_id}")
def get_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(PresenceLog).filter(PresenceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log

@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(PresenceLog).filter(PresenceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
