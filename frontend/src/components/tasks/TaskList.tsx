'use client';

import React, { useState, useMemo } from 'react';
import { Task, TaskFilter } from '@/types';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { TaskFilters } from './TaskFilters';
import { Plus, Search, ListTodo } from 'lucide-react';
import { apiClient } from '@/utils/api';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter tasks based on current filters and search
  const filteredTasks = useMemo(() => {
    // First deduplicate tasks by ID to prevent React key errors
    const uniqueTasks = tasks.filter((task, index, arr) => 
      arr.findIndex(t => t.id === task.id) === index
    );
    
    let filtered = [...uniqueTasks];

    // Apply completion filter
    if (filters.completed !== undefined) {
      filtered = filtered.filter(task => task.completed === filters.completed);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.category && task.category.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [tasks, filters, searchQuery]);

  const handleTaskToggle = async (taskId: number) => {
    const task = uniqueTasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      setLoading(true);
      const updatedTask = await apiClient.updateTask(taskId, {
        completed: !task.completed,
      });
      onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      setLoading(true);
      await apiClient.deleteTask(taskId);
      onTaskDelete(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      
      if (editingTask) {
        // Update existing task
        const updatedTask = await apiClient.updateTask(editingTask.id, taskData);
        onTaskUpdate(updatedTask);
      } else {
        // Create new task
        const newTask = await apiClient.createTask(taskData);
        onTaskCreate(newTask);
      }
      
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const uniqueTasks = useMemo(() => 
    tasks.filter((task, index, arr) => 
      arr.findIndex(t => t.id === task.id) === index
    ), [tasks]
  );
  
  const completedCount = uniqueTasks.filter(task => task.completed).length;
  const totalCount = uniqueTasks.length;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ListTodo className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Tasks
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <TaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          tasks={uniqueTasks}
        />
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {uniqueTasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {uniqueTasks.length === 0 
                ? 'Create your first task or ask the AI assistant to help you!'
                : 'Try adjusting your search or filters.'
              }
            </p>
            {uniqueTasks.length === 0 && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleTaskToggle}
                onDelete={handleTaskDelete}
                onEdit={handleTaskEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={loading}
        />
      )}
    </div>
  );
};