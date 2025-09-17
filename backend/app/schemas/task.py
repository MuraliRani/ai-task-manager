from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    category: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    category: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: int
    completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TaskFilter(BaseModel):
    completed: Optional[bool] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    search: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatResponse(BaseModel):
    response: str
    tasks_updated: bool = False
    task_data: Optional[list] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)