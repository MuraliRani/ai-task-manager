'use client';

import React, { useMemo } from 'react';
import { Task, TaskFilter } from '@/types';
import { Filter, X } from 'lucide-react';

interface TaskFiltersProps {
  filters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
  tasks: Task[];
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  tasks,
}) => {
  // Extract unique categories from tasks
  const uniqueCategories = useMemo(() => {
    const categories = tasks
      .map(task => task.category)
      .filter((category): category is string => Boolean(category));
    return Array.from(new Set(categories)).sort();
  }, [tasks]);

  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="space-y-3">
      {/* Filter Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters:
          </span>
        </div>

        {/* Completion Status Filter */}
        <select
          value={filters.completed === undefined ? '' : filters.completed.toString()}
          onChange={(e) => {
            const value = e.target.value;
            handleFilterChange('completed', value === '' ? undefined : value === 'true');
          }}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Tasks</option>
          <option value="false">Incomplete</option>
          <option value="true">Completed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Category Filter */}
        {uniqueCategories.length > 0 && (
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
          <div className="flex items-center space-x-2">
            {filters.completed !== undefined && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {filters.completed ? 'Completed' : 'Incomplete'}
                <button
                  onClick={() => handleFilterChange('completed', undefined)}
                  className="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.priority && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                {filters.priority.charAt(0).toUpperCase() + filters.priority.slice(1)} Priority
                <button
                  onClick={() => handleFilterChange('priority', undefined)}
                  className="ml-1 hover:text-purple-600 dark:hover:text-purple-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                {filters.category}
                <button
                  onClick={() => handleFilterChange('category', undefined)}
                  className="ml-1 hover:text-green-600 dark:hover:text-green-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};