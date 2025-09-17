# Frontend Documentation

## Overview
The frontend is built with Next.js 14, TypeScript, and Tailwind CSS, providing a modern and responsive interface for the AI Task Manager.

## Architecture

### Components Structure
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles
├── components/
│   ├── chat/              # Chat interface components
│   ├── tasks/             # Task management components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Key Components

### Main Application (`app/page.tsx`)
The main application component that orchestrates the entire user interface:
- Manages global state for tasks and chat messages
- Handles WebSocket connections
- Coordinates between chat and task interfaces

### Chat Interface (`components/chat/ChatInterface.tsx`)
Provides the conversational AI interface:
- Real-time messaging with the AI assistant
- Message history display
- Connection status indicators
- Loading states and error handling

### Task Management
- **TaskList**: Main task container with filtering and search
- **TaskItem**: Individual task display with actions
- **TaskForm**: Modal form for creating/editing tasks
- **TaskFilters**: Advanced filtering controls

## Hooks

### `useWebSocket`
Custom hook for WebSocket management:
```typescript
const { isConnected, sendChatMessage, error } = useWebSocket({
  url: WEBSOCKET_URL,
  onMessage: handleMessage,
  onTaskUpdate: handleTaskUpdate,
  // ... other handlers
});
```

### `useDarkMode`
Manages dark/light theme switching:
```typescript
const { isDark, toggleDarkMode } = useDarkMode();
```

## State Management

### Task State
Tasks are managed at the application level and passed down to components:
```typescript
const [tasks, setTasks] = useState<Task[]>([]);
```

### Chat State
Chat messages maintain conversation history:
```typescript
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
```

## Real-time Features

### WebSocket Integration
- Automatic reconnection on disconnect
- Health check pings
- Event-based updates for tasks
- Real-time chat responses

### Live Updates
- Tasks update immediately across all clients
- Visual indicators for connection status
- Optimistic UI updates with error handling

## Styling

### Tailwind CSS
The application uses Tailwind CSS for styling with:
- Responsive design patterns
- Dark mode support
- Consistent color palette
- Utility-first approach

### Dark Mode
Dark mode is implemented using:
- CSS classes (`dark:` prefix)
- Local storage persistence
- System preference detection
- Smooth transitions

## API Integration

### REST API
```typescript
// API client usage
const tasks = await apiClient.getTasks();
const newTask = await apiClient.createTask(taskData);
```

### WebSocket API
```typescript
// Sending messages
sendChatMessage("Create a task to buy groceries");

// Handling responses
const handleChatResponse = (message: ChatMessage) => {
  setChatMessages(prev => [...prev, message]);
};
```

## Type Safety

### Core Types
```typescript
interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  created_at: string;
  updated_at?: string;
  due_date?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  timestamp: string;
  isUser: boolean;
  tasksUpdated?: boolean;
}
```

## Performance Optimizations

### React Optimizations
- `useCallback` for stable function references
- `useMemo` for expensive computations
- Proper key props for list rendering

### WebSocket Optimization
- Connection pooling
- Message queuing during disconnection
- Debounced reconnection attempts

## Accessibility

### ARIA Support
- Proper ARIA labels for interactive elements
- Screen reader friendly components
- Keyboard navigation support

### Visual Accessibility
- High contrast color schemes
- Scalable font sizes
- Clear focus indicators

## Development

### Getting Started
```bash
cd frontend
npm install
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws
```

## Testing

### Component Testing
```bash
npm run test
```

### E2E Testing
```bash
npm run test:e2e
```

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```