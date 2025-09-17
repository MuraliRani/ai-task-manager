import os
from typing import Dict, Any

class TaskAgent:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
    def process_message(self, message: str) -> Dict[str, Any]:
        """Process a user message and return a response"""
        message_lower = message.lower().strip()
        
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
                "response": "Hello! I'm your AI assistant. I can help you manage tasks and answer questions about React.js. What would you like to learn or do today?",
                "tasks_updated": False,
                "task_data": None
            }
        
        # Handle task-related requests
        if any(keyword in message_lower for keyword in ['task', 'create', 'add', 'todo', 'reminder']):
            return {
                "response": "I can help you manage tasks! You can create, update, and delete tasks through our interface. Would you like me to guide you through task management or would you prefer to learn about React development?",
                "tasks_updated": False,
                "task_data": None
            }
        
        # Default response
        return {
            "response": "I'm here to help! I can assist with:\n\n• **React.js Learning** - Ask me about React concepts, components, hooks, etc.\n• **Task Management** - Help you organize and manage your tasks\n• **General Questions** - Feel free to ask anything!\n\nWhat would you like to explore?",
            "tasks_updated": False,
            "task_data": None
        }
    
    def _get_react_learning_response(self, message: str) -> str:
        """Generate React learning content based on the message"""
        return """# 🚀 **Learning React.js - Getting Started!**

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

# Create a global instance
task_agent = TaskAgent()

# Global agent instance
task_agent = TaskAgent()