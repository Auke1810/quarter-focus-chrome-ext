import React from 'react';

const TaskInput = ({ 
  currentTask, 
  showTaskDropdown,
  dailyStrategy,
  onTaskChange,
  onTaskFocus,
  onTaskSelect 
}) => {
  return (
    <div className="mb-4 sm:mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Current Task
      </label>
      <div className="relative task-dropdown-container">
        <input
          type="text"
          value={currentTask}
          onChange={(e) => onTaskChange(e.target.value)}
          onFocus={onTaskFocus}
          placeholder="What are you working on?"
          className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showTaskDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[200px] overflow-y-auto">
            {dailyStrategy.keyTask && (
              <button
                onClick={() => onTaskSelect(dailyStrategy.keyTask)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
                  currentTask === dailyStrategy.keyTask ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
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
                onClick={() => onTaskSelect(dailyStrategy.secondaryTask)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
                  currentTask === dailyStrategy.secondaryTask ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
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
