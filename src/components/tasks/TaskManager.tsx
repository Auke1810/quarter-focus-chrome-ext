import React from 'react';
import TaskInput from './TaskInput';
import CompletedTasks from './CompletedTasks';

const TaskManager: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TaskInput />
      <CompletedTasks />
    </div>
  );
};

export default TaskManager;
