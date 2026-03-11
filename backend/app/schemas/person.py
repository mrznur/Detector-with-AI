from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PersonBase(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None  # Male, Female, Other
    employee_id: Optional[str] = None

class PersonCreate(PersonBase):
    pass

class PersonUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    employee_id: Optional[str] = None
    is_active: Optional[bool] = None

class PersonResponse(PersonBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
