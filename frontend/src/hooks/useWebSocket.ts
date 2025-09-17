'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage, Task, ChatMessage } from '@/types';

interface UseWebSocketProps {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskCreate?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  onChatResponse?: (message: ChatMessage) => void;
}

export const useWebSocket = ({
  url,
  onMessage,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onChatResponse,
}: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (ws.current && ws.current.readyState === WebSocket.CONNECTING) {
      return;
    }
    
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle different message types
          switch (message.type) {
            case 'chat_response':
              if (onChatResponse) {
                onChatResponse({
                  id: Date.now().toString(),
                  message: '',
                  response: message.response || '',
                  timestamp: message.timestamp || new Date().toISOString(),
                  isUser: false,
                  tasksUpdated: message.tasks_updated,
                });
              }
              break;
            
            case 'task_created':
              if (onTaskCreate && message.task) {
                onTaskCreate(message.task);
              }
              break;
            
            case 'task_updated':
              if (onTaskUpdate && message.task) {
                onTaskUpdate(message.task);
              }
              break;
            
            case 'task_deleted':
              if (onTaskDelete && message.task_id) {
                onTaskDelete(message.task_id);
              }
              break;
            
            case 'tasks_updated':
              // Handle bulk task updates
              if (message.data) {
                console.log('Tasks updated:', message.data);
              }
              break;
            
            default:
              console.log('Unknown message type:', message.type);
          }

          // Call the general onMessage handler
          if (onMessage) {
            onMessage(message);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        
        // Only attempt to reconnect if it wasn't a manual disconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000); // Exponential backoff, max 10s
          setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
            connect();
          }, delay);
        } else {
          setError('Failed to connect after multiple attempts');
        }
      };

      ws.current.onerror = (event) => {
        // Only set error if we have meaningful error information
        if (event.type === 'error' && ws.current?.readyState === WebSocket.CLOSED) {
          setError('WebSocket connection failed');
          console.error('WebSocket error:', event);
          console.error('WebSocket URL:', url);
          console.error('WebSocket readyState:', ws.current?.readyState);
        }
      };
    } catch (err) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket connection error:', err);
    }
  }, [url, onMessage, onTaskUpdate, onTaskCreate, onTaskDelete, onChatResponse]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  const sendChatMessage = useCallback((message: string) => {
    sendMessage({
      type: 'chat',
      message,
    });
  }, [sendMessage]);

  const ping = useCallback(() => {
    sendMessage({ type: 'ping' });
  }, [sendMessage]);

  useEffect(() => {
    connect();

    return () => {
      // Clear reconnection attempts when component unmounts
      reconnectAttempts.current = maxReconnectAttempts;
      disconnect();
    };
  }, [connect, disconnect]);

  // Separate effect for ping interval to avoid recreating connection
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      ping();
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected, ping]);

  return {
    isConnected,
    error,
    sendMessage,
    sendChatMessage,
    disconnect,
    reconnect: connect,
  };
};