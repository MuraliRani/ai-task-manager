# Backend API Documentation

## Overview
The backend is built with FastAPI and provides a comprehensive REST API and WebSocket interface for the AI Task Manager application.

## API Endpoints

### Health Check
```
GET /health
```
Returns the health status of the API.

### Tasks

#### List Tasks
```
GET /api/v1/tasks
```
**Query Parameters:**
- `completed` (boolean, optional): Filter by completion status
- `priority` (string, optional): Filter by priority (low, medium, high)
- `category` (string, optional): Filter by category
- `search` (string, optional): Search in title and description
- `skip` (integer, optional): Number of tasks to skip (default: 0)
- `limit` (integer, optional): Maximum number of tasks to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Get milk, bread, and eggs",
    "completed": false,
    "priority": "medium",
    "category": "personal",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "due_date": "2024-01-02T18:00:00Z"
  }
]
```

#### Create Task
```
POST /api/v1/tasks
```
**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "priority": "medium",
  "category": "work",
  "due_date": "2024-01-02T18:00:00Z"
}
```

#### Get Task by ID
```
GET /api/v1/tasks/{task_id}
```

#### Update Task
```
PUT /api/v1/tasks/{task_id}
```
**Request Body:** Same as create task, all fields optional

#### Delete Task
```
DELETE /api/v1/tasks/{task_id}
```

### Chat

#### Send Chat Message
```
POST /api/v1/chat
```
**Request Body:**
```json
{
  "message": "Create a task to buy groceries",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Response:**
```json
{
  "response": "I've created a task for you to buy groceries!",
  "tasks_updated": true,
  "task_data": {...},
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## WebSocket API

### Connection
```
WS /api/v1/ws
```

### Message Types

#### Chat Message
```json
{
  "type": "chat",
  "message": "Show me all my tasks"
}
```

#### Ping/Pong (Health Check)
```json
{
  "type": "ping"
}
```

### Response Types

#### Chat Response
```json
{
  "type": "chat_response",
  "response": "Here are your tasks...",
  "tasks_updated": false,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### Task Events
```json
{
  "type": "task_created",
  "task": {...}
}
```

```json
{
  "type": "task_updated",
  "task": {...}
}
```

```json
{
  "type": "task_deleted",
  "task_id": 1
}
```

## AI Agent

### LangGraph Tools

The AI agent uses the following tools for task management:

1. **create_task_tool**: Creates new tasks
2. **update_task_tool**: Updates existing tasks
3. **delete_task_tool**: Deletes tasks
4. **list_tasks_tool**: Lists and filters tasks
5. **filter_tasks_tool**: Advanced task filtering

### Natural Language Examples

- "Create a high priority task to finish the report by Friday"
- "Mark task 1 as completed"
- "Show me all incomplete work tasks"
- "Delete the grocery shopping task"
- "Change the priority of task 2 to high"

## Database Schema

### Task Model
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE
);
```

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

Error responses include detailed messages:
```json
{
  "detail": "Task not found"
}
```