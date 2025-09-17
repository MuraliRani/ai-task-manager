export interface Task {
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

export interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  timestamp: string;
  isUser: boolean;
  tasksUpdated?: boolean;
}

export interface TaskFilter {
  completed?: boolean;
  priority?: string;
  category?: string;
  search?: string;
}

export interface WebSocketMessage {
  type: string;
  message?: string;
  response?: string;
  tasks_updated?: boolean;
  task_data?: any;
  data?: any;
  task?: Task;
  task_id?: number;
  tasks?: Task[];
  timestamp?: string;
}