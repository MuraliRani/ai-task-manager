# Simple task tools without langchain dependencies
from typing import Dict, Optional, Any
from datetime import datetime
from app.services.tasks import TaskService
from app.schemas.task import TaskCreate, TaskUpdate, TaskFilter
from app.db.session import SessionLocal

class TaskTools:
    def __init__(self):
        self.db = SessionLocal()
        self.task_service = TaskService(self.db)
    
    def close_db(self):
        if self.db:
            self.db.close()

def create_task_tool(
    title: str,
    description: str = "",
    priority: str = "medium",
    category: str = "",
    due_date: str = ""
) -> Dict[str, Any]:
    """
    Create a new task.
    
    Args:
        title: The title of the task (required)
        description: Detailed description of the task
        priority: Priority level (low, medium, high)
        category: Category or tag for the task
        due_date: Due date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
    
    Returns:
        Dictionary with task details and success status
    """
    try:
        task_tools = TaskTools()
        
        # Parse due_date if provided
        parsed_due_date = None
        if due_date:
            try:
                parsed_due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            except ValueError:
                return {"success": False, "error": "Invalid due_date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)"}
        
        task_data = TaskCreate(
            title=title,
            description=description or None,
            priority=priority,
            category=category or None,
            due_date=parsed_due_date
        )
        
        task = task_tools.task_service.create_task(task_data)
        task_tools.close_db()
        
        return {
            "success": True,
            "message": f"Task '{title}' created successfully!",
            "task": task.to_dict()
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def update_task_tool(
    task_id: int,
    title: str = "",
    description: str = "",
    completed: Optional[bool] = None,
    priority: str = "",
    category: str = "",
    due_date: str = ""
) -> Dict[str, Any]:
    """
    Update an existing task.
    
    Args:
        task_id: ID of the task to update (required)
        title: New title for the task
        description: New description for the task
        completed: Mark task as completed (true) or incomplete (false)
        priority: New priority level (low, medium, high)
        category: New category for the task
        due_date: New due date in ISO format
    
    Returns:
        Dictionary with updated task details and success status
    """
    try:
        task_tools = TaskTools()
        
        # Parse due_date if provided
        parsed_due_date = None
        if due_date:
            try:
                parsed_due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            except ValueError:
                return {"success": False, "error": "Invalid due_date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)"}
        
        update_data = {}
        if title:
            update_data["title"] = title
        if description:
            update_data["description"] = description
        if completed is not None:
            update_data["completed"] = completed
        if priority:
            update_data["priority"] = priority
        if category:
            update_data["category"] = category
        if parsed_due_date:
            update_data["due_date"] = parsed_due_date
        
        if not update_data:
            return {"success": False, "error": "No fields to update provided"}
        
        task_update = TaskUpdate(**update_data)
        task = task_tools.task_service.update_task(task_id, task_update)
        task_tools.close_db()
        
        if not task:
            return {"success": False, "error": f"Task with ID {task_id} not found"}
        
        return {
            "success": True,
            "message": f"Task {task_id} updated successfully!",
            "task": task.to_dict()
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def delete_task_tool(task_id: int) -> Dict[str, Any]:
    """
    Delete a task.
    
    Args:
        task_id: ID of the task to delete (required)
    
    Returns:
        Dictionary with success status and message
    """
    try:
        task_tools = TaskTools()
        success = task_tools.task_service.delete_task(task_id)
        task_tools.close_db()
        
        if not success:
            return {"success": False, "error": f"Task with ID {task_id} not found"}
        
        return {
            "success": True,
            "message": f"Task {task_id} deleted successfully!"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def list_tasks_tool(
    completed: Optional[bool] = None,
    priority: str = "",
    category: str = "",
    search: str = "",
    limit: int = 50
) -> Dict[str, Any]:
    """
    List tasks with optional filtering.
    
    Args:
        completed: Filter by completion status (true/false)
        priority: Filter by priority (low, medium, high)
        category: Filter by category
        search: Search in title and description
        limit: Maximum number of tasks to return
    
    Returns:
        Dictionary with list of tasks and success status
    """
    try:
        task_tools = TaskTools()
        
        filters = TaskFilter(
            completed=completed,
            priority=priority if priority else None,
            category=category if category else None,
            search=search if search else None
        )
        
        tasks = task_tools.task_service.get_tasks(filters=filters, limit=limit)
        task_tools.close_db()
        
        task_list = [task.to_dict() for task in tasks]
        
        return {
            "success": True,
            "message": f"Found {len(task_list)} tasks",
            "tasks": task_list,
            "count": len(task_list)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def filter_tasks_tool(
    filter_type: str,
    filter_value: str = ""
) -> Dict[str, Any]:
    """
    Filter tasks by specific criteria.
    
    Args:
        filter_type: Type of filter (priority, category, completed, overdue, search)
        filter_value: Value to filter by
    
    Returns:
        Dictionary with filtered tasks and success status
    """
    try:
        task_tools = TaskTools()
        
        if filter_type == "priority":
            tasks = task_tools.task_service.get_tasks_by_priority(filter_value)
        elif filter_type == "category":
            tasks = task_tools.task_service.get_tasks_by_category(filter_value)
        elif filter_type == "completed":
            completed_status = filter_value.lower() == "true"
            filters = TaskFilter(completed=completed_status)
            tasks = task_tools.task_service.get_tasks(filters=filters)
        elif filter_type == "overdue":
            tasks = task_tools.task_service.get_overdue_tasks()
        elif filter_type == "search":
            filters = TaskFilter(search=filter_value)
            tasks = task_tools.task_service.get_tasks(filters=filters)
        else:
            return {"success": False, "error": f"Invalid filter_type: {filter_type}"}
        
        task_tools.close_db()
        task_list = [task.to_dict() for task in tasks]
        
        return {
            "success": True,
            "message": f"Found {len(task_list)} tasks with filter '{filter_type}': '{filter_value}'",
            "tasks": task_list,
            "count": len(task_list)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# List of all available tools
TASK_TOOLS = [
    create_task_tool,
    update_task_tool,
    delete_task_tool,
    list_tasks_tool,
    filter_tasks_tool
]