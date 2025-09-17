import { Task, TaskFilter, ChatMessage } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Task API methods
  async getTasks(filters?: TaskFilter): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Task[]>(endpoint);
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: number): Promise<void> {
    await this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getTask(id: number): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  // Chat API methods
  async sendChatMessage(message: string): Promise<{
    response: string;
    tasks_updated: boolean;
    task_data?: any;
  }> {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();