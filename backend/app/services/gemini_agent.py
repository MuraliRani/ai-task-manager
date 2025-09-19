import os
from typing import Dict, Any
import google.generativeai as genai
from app.services.langgraph_tools import create_task_tool, list_tasks_tool
import re

class TaskAgent:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        if self.gemini_api_key and self.gemini_api_key != "your_gemini_api_key_here":
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            self.use_ai = True
        else:
            self.use_ai = False
            print("Warning: GEMINI_API_KEY not set or using placeholder. Using fallback mode.")
        
    def process_message(self, message: str) -> Dict[str, Any]:
        """Process a user message and return a response"""
        message_lower = message.lower().strip()
        
        # Check if this is a task creation request
        if self._is_task_creation_request(message_lower):
            return self._handle_task_creation(message)
        
        # Check if this is a task listing request
        if self._is_task_listing_request(message_lower):
            return self._handle_task_listing(message)
            
        # Handle React learning requests
        if any(keyword in message_lower for keyword in ['learn react', 'react js', 'react.js', 'reactjs', 'react']):
            return {
                "response": self._get_react_learning_response(message_lower),
                "tasks_updated": False,
                "task_data": None
            }
        
        # Handle general greetings
        if any(keyword in message_lower for keyword in ['hi', 'hello', 'hey', 'good morning', 'good afternoon']):
            return {
                "response": "Hello! I'm your AI assistant. I can help you manage tasks and answer questions about React.js. Try saying 'Create a task to practice React' or 'Show me my tasks'. What would you like to do?",
                "tasks_updated": False,
                "task_data": None
            }
        
        # Use AI if available, otherwise use fallback
        if self.use_ai:
            return self._process_with_ai(message)
        else:
            return self._fallback_response(message)
    
    def _is_task_creation_request(self, message: str) -> bool:
        """Check if the message is requesting task creation"""
        creation_keywords = [
            'create', 'make', 'add', 'new task', 'task to', 'reminder to',
            'need to', 'should', 'todo', 'do:', 'task:', 'remind me to'
        ]
        return any(keyword in message for keyword in creation_keywords)
    
    def _is_task_listing_request(self, message: str) -> bool:
        """Check if the message is requesting to list tasks"""
        listing_keywords = [
            'show', 'list', 'see my tasks', 'what tasks', 'my todo',
            'tasks do i have', 'what do i need to do'
        ]
        return any(keyword in message for keyword in listing_keywords)
    
    def _extract_task_details(self, message: str) -> Dict[str, str]:
        """Extract task details from natural language"""
        # Default values
        title = ""
        description = ""
        priority = "medium"
        category = ""
        
        # Extract title - look for patterns like "task to [action]" or "create [task]"
        patterns = [
            r"task to (.+?)(?:\.|$)",
            r"create (?:a )?(?:task )?(?:to )?(.+?)(?:\.|$)",
            r"make (?:a )?(?:task )?(?:to )?(.+?)(?:\.|$)",
            r"add (?:a )?(?:task )?(?:to )?(.+?)(?:\.|$)",
            r"remind me to (.+?)(?:\.|$)",
            r"need to (.+?)(?:\.|$)",
            r"should (.+?)(?:\.|$)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, message.lower())
            if match:
                title = match.group(1).strip()
                break
        
        # If no pattern matched, use the whole message after common prefixes
        if not title:
            prefixes = ['create a task', 'make a task', 'add a task', 'new task', 'task']
            for prefix in prefixes:
                if message.lower().startswith(prefix):
                    title = message[len(prefix):].strip().lstrip('to').strip()
                    break
            if not title:
                title = message.strip()
        
        # Clean up the title
        title = title.strip('.,!?').strip()
        
        # Set priority based on keywords
        if any(word in message.lower() for word in ['urgent', 'important', 'asap', 'high priority']):
            priority = "high"
        elif any(word in message.lower() for word in ['low priority', 'when i have time', 'eventually']):
            priority = "low"
        
        # Set category based on keywords
        if any(word in message.lower() for word in ['react', 'typescript', 'javascript', 'coding', 'programming', 'development']):
            category = "development"
        elif any(word in message.lower() for word in ['study', 'learn', 'practice', 'tutorial']):
            category = "learning"
        elif any(word in message.lower() for word in ['work', 'project', 'meeting']):
            category = "work"
        elif any(word in message.lower() for word in ['personal', 'home', 'family']):
            category = "personal"
        
        return {
            "title": title,
            "description": description,
            "priority": priority,
            "category": category
        }
    
    def _handle_task_creation(self, message: str) -> Dict[str, Any]:
        """Handle task creation requests"""
        try:
            # Extract task details from the message
            task_details = self._extract_task_details(message)
            
            if not task_details["title"]:
                return {
                    "response": "I'd be happy to create a task for you! Could you please specify what task you'd like me to create? For example: 'Create a task to practice React components'",
                    "tasks_updated": False,
                    "task_data": None
                }
            
            # Use the create_task_tool
            result = create_task_tool(
                title=task_details["title"],
                description=task_details["description"],
                priority=task_details["priority"],
                category=task_details["category"]
            )
            
            if result["success"]:
                response = f"✅ Great! I've created a task for you:\n\n**{task_details['title']}**"
                if task_details["category"]:
                    response += f"\n📂 Category: {task_details['category']}"
                if task_details["priority"] != "medium":
                    response += f"\n⚡ Priority: {task_details['priority']}"
                
                response += "\n\nThe task has been added to your task list. You can see it on the right side of the screen!"
                
                return {
                    "response": response,
                    "tasks_updated": True,
                    "task_data": result["task"]
                }
            else:
                return {
                    "response": f"Sorry, I couldn't create the task. Error: {result.get('error', 'Unknown error')}",
                    "tasks_updated": False,
                    "task_data": None
                }
                
        except Exception as e:
            return {
                "response": f"Sorry, I encountered an error while creating the task: {str(e)}",
                "tasks_updated": False,
                "task_data": None
            }
    
    def _handle_task_listing(self, message: str) -> Dict[str, Any]:
        """Handle task listing requests"""
        try:
            result = list_tasks_tool(limit=10)
            
            if result["success"]:
                tasks = result.get("tasks", [])
                if not tasks:
                    return {
                        "response": "You don't have any tasks yet! Try creating one by saying 'Create a task to practice React components'.",
                        "tasks_updated": False,
                        "task_data": None
                    }
                
                response = f"📋 **Your Tasks ({len(tasks)} total):**\n\n"
                for i, task in enumerate(tasks[:5], 1):  # Show first 5 tasks
                    status = "✅" if task.get("completed") else "⭕"
                    response += f"{i}. {status} **{task.get('title', 'Untitled')}**"
                    if task.get("category"):
                        response += f" ({task['category']})"
                    response += "\n"
                
                if len(tasks) > 5:
                    response += f"\n... and {len(tasks) - 5} more tasks. Check the task list on the right to see all!"
                
                return {
                    "response": response,
                    "tasks_updated": False,
                    "task_data": None
                }
            else:
                return {
                    "response": f"Sorry, I couldn't retrieve your tasks. Error: {result.get('error', 'Unknown error')}",
                    "tasks_updated": False,
                    "task_data": None
                }
                
        except Exception as e:
            return {
                "response": f"Sorry, I encountered an error while fetching your tasks: {str(e)}",
                "tasks_updated": False,
                "task_data": None
            }
    
    def _process_with_ai(self, message: str) -> Dict[str, Any]:
        """Process message using Gemini AI"""
        try:
            # Create a prompt that helps the AI understand the context
            prompt = f"""You are a helpful AI assistant for a task management application. The user said: "{message}"

You can help with:
1. Task management (creating, listing, updating tasks)
2. React.js learning and programming questions
3. General assistance

If the user wants to create a task, I'll handle that separately.
If the user wants to see their tasks, I'll handle that separately.

Provide a helpful, friendly response. If it's about React or programming, include practical advice or code examples.
Keep responses concise but informative."""
            
            response = self.model.generate_content(prompt)
            
            return {
                "response": response.text,
                "tasks_updated": False,
                "task_data": None
            }
            
        except Exception as e:
            return self._fallback_response(message)
    
    def _fallback_response(self, message: str) -> Dict[str, Any]:
        """Fallback response when AI is not available"""
        message_lower = message.lower().strip()
        
        # Handle task-related requests
        if any(keyword in message_lower for keyword in ['task', 'create', 'add', 'todo', 'reminder']):
            return {
                "response": "I can help you manage tasks! Try saying:\n\n• 'Create a task to practice React components'\n• 'Make a task to learn TypeScript'\n• 'Show me my tasks'\n\nWhat specific task would you like to create?",
                "tasks_updated": False,
                "task_data": None
            }
        
        # Default response
        return {
            "response": "I'm here to help! I can assist with:\n\n• **Task Management** - Say 'Create a task to...' or 'Show my tasks'\n• **React.js Learning** - Ask me about React concepts, components, hooks, etc.\n• **General Questions** - Feel free to ask anything!\n\nWhat would you like to explore?",
            "tasks_updated": False,
            "task_data": None
        }
    
    def _get_react_learning_response(self, message: str) -> str:
        """Generate React learning content based on the message"""
        react_content = """# 🚀 **Learning React.js - Getting Started!**

**React** is a popular JavaScript library for building user interfaces, especially web applications.

## 📚 **Core Concepts to Learn:**

### 1. **Components**
```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
```

### 2. **JSX (JavaScript XML)**
- Write HTML-like syntax in JavaScript
- Mix JavaScript expressions with HTML elements

### 3. **Props & State**
- **Props**: Data passed from parent to child components
- **State**: Component's internal data that can change

### 4. **Hooks** (Modern React)
```jsx
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## 🛠️ **Next Steps:**
1. **Set up a React project**: `npx create-react-app my-app`
2. **Learn useState and useEffect hooks**
3. **Practice building components**
4. **Learn about event handling**
5. **Explore React Router for navigation**

## 📖 **Great Resources:**
- [React Official Docs](https://react.dev)
- [React Tutorial](https://react.dev/learn)
- Practice building small projects!

**What specific React topic would you like to dive deeper into?** 🤔"""
        return react_content

# Create a global instance
task_agent = TaskAgent()