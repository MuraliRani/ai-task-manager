from sqlalchemy.orm import Session
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskFilter
from typing import List, Optional
from datetime import datetime

class TaskService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_task(self, task_data: TaskCreate) -> Task:
        """Create a new task"""
        db_task = Task(**task_data.model_dump())
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task
    
    def get_task(self, task_id: int) -> Optional[Task]:
        """Get a task by ID"""
        return self.db.query(Task).filter(Task.id == task_id).first()
    
    def get_tasks(self, filters: Optional[TaskFilter] = None, skip: int = 0, limit: int = 100) -> List[Task]:
        """Get all tasks with optional filtering"""
        query = self.db.query(Task)
        
        if filters:
            if filters.completed is not None:
                query = query.filter(Task.completed == filters.completed)
            if filters.priority:
                query = query.filter(Task.priority == filters.priority)
            if filters.category:
                query = query.filter(Task.category == filters.category)
            if filters.search:
                search_pattern = f"%{filters.search}%"
                query = query.filter(
                    Task.title.ilike(search_pattern) | 
                    Task.description.ilike(search_pattern)
                )
        
        return query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    
    def update_task(self, task_id: int, task_data: TaskUpdate) -> Optional[Task]:
        """Update a task"""
        db_task = self.get_task(task_id)
        if not db_task:
            return None
        
        update_data = task_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)
        
        db_task.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_task)
        return db_task
    
    def delete_task(self, task_id: int) -> bool:
        """Delete a task"""
        db_task = self.get_task(task_id)
        if not db_task:
            return False
        
        self.db.delete(db_task)
        self.db.commit()
        return True
    
    def mark_task_complete(self, task_id: int) -> Optional[Task]:
        """Mark a task as complete"""
        return self.update_task(task_id, TaskUpdate(completed=True))
    
    def mark_task_incomplete(self, task_id: int) -> Optional[Task]:
        """Mark a task as incomplete"""
        return self.update_task(task_id, TaskUpdate(completed=False))
    
    def get_tasks_by_priority(self, priority: str) -> List[Task]:
        """Get tasks by priority"""
        return self.db.query(Task).filter(Task.priority == priority).order_by(Task.created_at.desc()).all()
    
    def get_tasks_by_category(self, category: str) -> List[Task]:
        """Get tasks by category"""
        return self.db.query(Task).filter(Task.category == category).order_by(Task.created_at.desc()).all()
    
    def get_overdue_tasks(self) -> List[Task]:
        """Get overdue tasks"""
        now = datetime.utcnow()
        return self.db.query(Task).filter(
            Task.due_date < now,
            Task.completed == False
        ).order_by(Task.due_date.asc()).all()