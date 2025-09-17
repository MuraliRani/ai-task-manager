'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Task, ChatMessage, WebSocketMessage } from '@/types';
import { TaskList } from '@/components/tasks/TaskList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiClient } from '@/utils/api';
import { v4 as uuidv4 } from 'uuid';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isDark, toggleDarkMode } = useDarkMode();

  // WebSocket handlers with deduplication
  const handleTaskUpdate = useCallback((task: Task) => {
    setTasks(prevTasks => {
      const existingIndex = prevTasks.findIndex(t => t.id === task.id);
      if (existingIndex !== -1) {
        // Update existing task
        const updatedTasks = [...prevTasks];
        updatedTasks[existingIndex] = task;
        return updatedTasks;
      }
      return prevTasks;
    });
  }, []);

  const handleTaskCreate = useCallback((task: Task) => {
    setTasks(prevTasks => {
      // Check if task already exists to prevent duplicates
      const exists = prevTasks.some(t => t.id === task.id);
      if (!exists) {
        return [task, ...prevTasks];
      }
      return prevTasks;
    });
  }, []);

  const handleTaskDelete = useCallback((taskId: number) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
  }, []);

  const handleChatResponse = useCallback((message: ChatMessage) => {
    setChatMessages(prevMessages => [...prevMessages, message]);
    setIsLoading(false);
  }, []);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('WebSocket message received:', message);
    
    // Handle bulk task list updates (avoid conflicts with individual handlers)
    if (message.type === 'tasks_updated' && message.data) {
      if (Array.isArray(message.data)) {
        // Only update if we have a complete task list
        setTasks(prevTasks => {
          // Deduplicate tasks by ID
          const newTasks = message.data as Task[];
          const uniqueTasks = newTasks.filter((task, index, arr) => 
            arr.findIndex(t => t.id === task.id) === index
          );
          return uniqueTasks;
        });
      }
    }
    // Note: Individual task updates are handled by specific handlers
    // (handleTaskCreate, handleTaskUpdate, handleTaskDelete)
  }, []);

  // Initialize WebSocket connection
  const { 
    isConnected, 
    sendChatMessage, 
    error: wsError 
  } = useWebSocket({
    url: WEBSOCKET_URL,
    onMessage: handleWebSocketMessage,
    onTaskUpdate: handleTaskUpdate,
    onTaskCreate: handleTaskCreate,
    onTaskDelete: handleTaskDelete,
    onChatResponse: handleChatResponse,
  });

  // Load initial tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const initialTasks = await apiClient.getTasks();
        console.log('Initial tasks loaded:', initialTasks.length);
        setTasks(initialTasks);
      } catch (err) {
        setError('Failed to load tasks');
        console.error('Error loading tasks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);
  
  // Debug effect to monitor task state
  useEffect(() => {
    const duplicates = tasks.filter((task, index, arr) => 
      arr.findIndex(t => t.id === task.id) !== index
    );
    if (duplicates.length > 0) {
      console.warn('Duplicate tasks detected:', duplicates.map(t => ({ id: t.id, title: t.title })));
    }
  }, [tasks]);

  // Handle sending chat messages
  const handleSendMessage = useCallback(async (message: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      message,
      timestamp: new Date().toISOString(),
      isUser: true,
    };

    setChatMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      if (isConnected) {
        // Use WebSocket for real-time communication
        sendChatMessage(message);
      } else {
        // Fallback to REST API
        const response = await apiClient.sendChatMessage(message);
        const aiResponse: ChatMessage = {
          id: uuidv4(),
          message: '',
          response: response.response,
          timestamp: new Date().toISOString(),
          isUser: false,
          tasksUpdated: response.tasks_updated,
        };
        setChatMessages(prevMessages => [...prevMessages, aiResponse]);
        setIsLoading(false);
        
        // Refresh tasks if they were updated
        if (response.tasks_updated) {
          const updatedTasks = await apiClient.getTasks();
          setTasks(updatedTasks);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorResponse: ChatMessage = {
        id: uuidv4(),
        message: '',
        response: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        isUser: false,
      };
      setChatMessages(prevMessages => [...prevMessages, errorResponse]);
      setIsLoading(false);
    }
  }, [isConnected, sendChatMessage]);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            AI Task Manager
          </h1>
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle isDark={isDark} onToggle={toggleDarkMode} />
          </div>
        </div>
        
        {/* Error Display */}
        {(error || wsError) && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              {error || wsError}
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-100px)] flex">
        {/* Chat Interface */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isConnected={isConnected}
          />
        </div>

        {/* Task List */}
        <div className="w-1/2">
          <TaskList
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskCreate={handleTaskCreate}
            onTaskDelete={handleTaskDelete}
          />
        </div>
      </div>
    </div>
  );
}