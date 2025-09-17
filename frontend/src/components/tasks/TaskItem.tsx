'use client';

import React from 'react';
import { Task } from '@/types';
import { CheckCircle, Circle, Calendar, Tag, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const handleToggle = () => {
    onToggle(task.id);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`
      bg-white rounded-lg border border-gray-200 p-4 
      hover:shadow-md transition-shadow duration-200
      ${task.completed ? 'opacity-75' : ''}
    `}>
      <div className="flex items-start space-x-3">
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="mt-1 text-gray-400 hover:text-blue-500 transition-colors"
        >
          {task.completed ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`
                text-lg font-medium text-gray-900
                ${task.completed ? 'line-through text-gray-500' : ''}
              `}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className={`
                  mt-1 text-sm text-gray-600
                  ${task.completed ? 'line-through' : ''}
                `}>
                  {task.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={handleEdit}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Edit task"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Task Metadata */}
          <div className="mt-3 flex items-center space-x-4 text-sm">
            {/* Priority */}
            <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${priorityColors[task.priority]}
            `}>
              {task.priority.toUpperCase()}
            </span>

            {/* Category */}
            {task.category && (
              <div className="flex items-center text-gray-500">
                <Tag className="w-4 h-4 mr-1" />
                <span>{task.category}</span>
              </div>
            )}

            {/* Due Date */}
            {task.due_date && (
              <div className="flex items-center text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(task.due_date)}</span>
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center text-gray-400">
              <span className="text-xs">
                Created {formatDate(task.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};