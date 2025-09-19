from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from app.db.session import get_db
from app.services.tasks import TaskService
from app.services.gemini_agent import task_agent
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskFilter,
    ChatMessage, ChatResponse
)

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove broken connections
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

manager = ConnectionManager()

# REST API Routes
@router.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(
    completed: Optional[bool] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all tasks with optional filtering"""
    task_service = TaskService(db)
    filters = TaskFilter(
        completed=completed,
        priority=priority,
        category=category,
        search=search
    )
    tasks = task_service.get_tasks(filters=filters, skip=skip, limit=limit)
    return [TaskResponse.model_validate(task) for task in tasks]

@router.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    task_service = TaskService(db)
    db_task = task_service.create_task(task)
    
    # Broadcast update to all WebSocket connections
    await manager.broadcast(json.dumps({
        "type": "task_created",
        "task": db_task.to_dict()
    }))
    
    return TaskResponse.model_validate(db_task)

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task"""
    task_service = TaskService(db)
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse.model_validate(task)

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    """Update a task"""
    task_service = TaskService(db)
    db_task = task_service.update_task(task_id, task)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Broadcast update to all WebSocket connections
    await manager.broadcast(json.dumps({
        "type": "task_updated",
        "task": db_task.to_dict()
    }))
    
    return TaskResponse.model_validate(db_task)

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    task_service = TaskService(db)
    success = task_service.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Broadcast update to all WebSocket connections
    await manager.broadcast(json.dumps({
        "type": "task_deleted",
        "task_id": task_id
    }))
    
    return {"message": "Task deleted successfully"}

# Chat API Route
@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(message: ChatMessage, db: Session = Depends(get_db)):
    """Process a chat message with the AI agent"""
    try:
        # Process message with the Gemini agent
        result = task_agent.process_message(message.message)
        
        # If tasks were updated, broadcast the changes
        if result.get("tasks_updated") and result.get("task_data"):
            await manager.broadcast(json.dumps({
                "type": "tasks_updated",
                "data": result["task_data"]
            }))
        
        return ChatResponse(
            response=result["response"],
            tasks_updated=result.get("tasks_updated", False),
            task_data=result.get("task_data")
        )
    except Exception as e:
        return ChatResponse(
            response=f"I'm sorry, I encountered an error: {str(e)}",
            tasks_updated=False
        )

# WebSocket Routes
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "chat":
                # Process chat message
                result = task_agent.process_message(message_data.get("message", ""))
                
                # Send response back to the client
                await manager.send_personal_message(json.dumps({
                    "type": "chat_response",
                    "response": result["response"],
                    "tasks_updated": result.get("tasks_updated", False),
                    "task_data": result.get("task_data"),
                    "timestamp": datetime.utcnow().isoformat()
                }), websocket)
                
                # If tasks were updated, broadcast to all clients
                if result.get("tasks_updated") and result.get("task_data"):
                    await manager.broadcast(json.dumps({
                        "type": "tasks_updated",
                        "data": result["task_data"],
                        "timestamp": datetime.utcnow().isoformat()
                    }))
            
            elif message_data.get("type") == "ping":
                # Respond to ping for connection health check
                await manager.send_personal_message(json.dumps({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                }), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}