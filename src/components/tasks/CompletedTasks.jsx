import React from 'react';

const CompletedTasks = ({ completedTasks, calculateTotalTime }) => {
  return (
    <div className="flex-1 min-h-0">
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Tasks done today</h2>
      <div className="space-y-1.5 sm:space-y-2 overflow-y-auto max-h-full">
        {completedTasks.map((task, index) => (
          <div key={index} className="flex items-center text-sm sm:text-base text-gray-700">
            <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
              task.type === 'key' ? 'bg-blue-500' : 
              task.type === 'secondary' ? 'bg-green-500' : 
              'bg-gray-500'
            }`}></div>
            <span className="truncate">{task.text}</span>
            <span className="ml-2 flex-shrink-0">/ {task.duration}</span>
          </div>
        ))}
        {completedTasks.length === 0 && (
          <div className="text-sm text-gray-500">No tasks completed yet</div>
        )}
        {completedTasks.length > 0 && (
          <div className="pt-3 mt-3 sm:pt-4 sm:mt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm sm:text-base text-gray-700">
              <span>Total time today:</span>
              <span>{calculateTotalTime(completedTasks)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedTasks;
