'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';
import { Send, Bot, User, Loader } from 'lucide-react';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isConnected: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isConnected,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputMessage.trim();
    if (message && !isLoading) {
      onSendMessage(message);
      setInputMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Chat Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              AI Task Assistant
            </h2>
            <p className="text-sm text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'} • Ask me to manage your tasks!
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to your AI Task Assistant!
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              I can help you create, update, delete, and manage your tasks through natural conversation. 
              Try saying something like:
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="bg-gray-100 rounded-lg p-3 max-w-md mx-auto">
                "Create a task to buy groceries with high priority"
              </div>
              <div className="bg-gray-100 rounded-lg p-3 max-w-md mx-auto">
                "Show me all incomplete tasks"
              </div>
              <div className="bg-gray-100 rounded-lg p-3 max-w-md mx-auto">
                "Mark task 1 as completed"
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="space-y-2">
              {/* User Message */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-blue-600 text-white rounded-lg rounded-tl-none px-4 py-2 max-w-xs lg:max-w-md">
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>

              {/* AI Response */}
              {message.response && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 text-gray-900 rounded-lg rounded-tl-none px-4 py-2 max-w-xs lg:max-w-md">
                      <p className="text-sm whitespace-pre-wrap">{message.response}</p>
                      {message.tasksUpdated && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Tasks updated
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg rounded-tl-none px-4 py-2 max-w-xs lg:max-w-md">
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me to manage your tasks..."
              disabled={isLoading || !isConnected}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">
            Connection lost. Trying to reconnect...
          </p>
        )}
      </div>
    </div>
  );
};