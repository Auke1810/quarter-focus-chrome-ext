import React from 'react';
import usePomodoroStore from '../../store/pomodoroStore';

const TaskInput: React.FC = () => {
  const { 
    selectedTask, 
    setSelectedTask, 
    dailyStrategy,
    showTaskDropdown,
    setShowTaskDropdown,
    selectPredefinedTask
  } = usePomodoroStore();

  if (!dailyStrategy) return null;

  return (
    <div className="mb-4 sm:mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2" htmlFor="current-task">
        Current Task
      </label>
      <div className="relative task-dropdown-container">
        <input
          id="current-task"
          type="text"
          value={selectedTask || ''}
          onChange={(e) => setSelectedTask(e.target.value)}
          onFocus={() => setShowTaskDropdown(true)}
          placeholder="What are you working on?"
          className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Current task input"
          aria-expanded={showTaskDropdown}
          aria-controls={showTaskDropdown ? "task-suggestions" : undefined}
          role="combobox"
        />
        {showTaskDropdown && (
          <div 
            id="task-suggestions"
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[200px] overflow-y-auto"
            role="listbox"
            aria-label="Task suggestions"
          >
            {dailyStrategy.keyTask && (
              <button
                onClick={() => selectPredefinedTask('key')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm w-full ${
                  selectedTask === dailyStrategy.keyTask ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
                role="option"
                aria-selected={selectedTask === dailyStrategy.keyTask}
              >
                <span className="font-medium truncate">Key: {dailyStrategy.keyTask}</span>
                {dailyStrategy.keyTaskPomodoros && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {dailyStrategy.keyTaskPomodoros} 🍅
                  </span>
                )}
              </button>
            )}
            {dailyStrategy.secondaryTask && (
              <button
                onClick={() => selectPredefinedTask('secondary')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm w-full ${
                  selectedTask === dailyStrategy.secondaryTask ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
                role="option"
                aria-selected={selectedTask === dailyStrategy.secondaryTask}
              >
                <span className="font-medium truncate">Secondary: {dailyStrategy.secondaryTask}</span>
                {dailyStrategy.secondaryTaskPomodoros && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {dailyStrategy.secondaryTaskPomodoros} 🍅
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskInput;
