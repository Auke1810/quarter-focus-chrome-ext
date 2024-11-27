import React from 'react';
import TaskInput from './TaskInput';
import CompletedTasks from './CompletedTasks';

/**
 * TaskManager Component
 * 
 * Container component that manages the task-related UI sections.
 * Combines task input and completed tasks display.
 * 
 * Component Structure:
 * - TaskInput for entering/selecting current task
 * - CompletedTasks for displaying task history
 * 
 * Layout:
 * - Vertical stack layout
 * - Proper spacing between sections
 * - Responsive padding
 * 
 * @component
 * @example
 * return (
 *   <TaskManager />
 * )
 */
const TaskManager: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TaskInput />
      <CompletedTasks />
    </div>
  );
};

export default TaskManager;
