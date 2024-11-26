import React, { useEffect, useState } from 'react';

const parseDurationToMinutes = (duration) => {
  let totalMinutes = 0;
  if (duration.includes('h')) {
    const [hours, minutes] = duration.split('h');
    totalMinutes += parseInt(hours) * 60;
    if (minutes) {
      totalMinutes += parseInt(minutes);
    }
  } else {
    totalMinutes += parseInt(duration);
  }
  return totalMinutes;
};

const formatMinutesToDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
};

const CompletedTasks = ({ completedTasks, calculateTotalTime }) => {
  const [dailyStrategy, setDailyStrategy] = useState(null);

  useEffect(() => {
    // Load daily strategy to check planned Pomodoros
    chrome.storage.local.get(['dailyStrategy'], (result) => {
      if (result.dailyStrategy) {
        setDailyStrategy(result.dailyStrategy);
      }
    });
  }, []);

  // Group tasks by text for key and secondary tasks
  const groupedTasks = completedTasks.reduce((acc, task) => {
    if (task.type === 'key' || task.type === 'secondary') {
      if (!acc[task.text]) {
        acc[task.text] = {
          ...task,
          totalMinutes: parseDurationToMinutes(task.duration),
          completedPomodoros: task.completedPomodoros || 0
        };
      } else {
        acc[task.text].totalMinutes += parseDurationToMinutes(task.duration);
        acc[task.text].completedPomodoros += task.completedPomodoros || 0;
        acc[task.text].duration = formatMinutesToDuration(acc[task.text].totalMinutes);
      }
    } else {
      // For regular tasks, keep them as individual entries
      if (!acc[task.text + task.timestamp]) { // Use timestamp to make key unique
        acc[task.text + task.timestamp] = task;
      }
    }
    return acc;
  }, {});

  const sortedTasks = Object.values(groupedTasks).sort((a, b) => {
    // Sort by type first (key tasks first, then secondary, then rest)
    const typeOrder = { key: 0, secondary: 1, rest: 2 };
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }
    // Then sort by timestamp
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const isTaskOverrun = (task) => {
    if (!dailyStrategy) return false;
    
    if (task.type === 'key' && dailyStrategy.keyTask === task.text) {
      return task.completedPomodoros > dailyStrategy.keyTaskPomodoros;
    }
    if (task.type === 'secondary' && dailyStrategy.secondaryTask === task.text) {
      return task.completedPomodoros > dailyStrategy.secondaryTaskPomodoros;
    }
    return false;
  };

  return (
    <div className="flex-1 min-h-0">
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Tasks done today</h2>
      <div className="space-y-1.5 sm:space-y-2 overflow-y-auto max-h-full">
        {sortedTasks.map((task, index) => {
          const overrun = isTaskOverrun(task);
          return (
            <div key={index} className="flex items-center text-sm sm:text-base text-gray-700">
              <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                task.type === 'key' ? 'bg-blue-500' : 
                task.type === 'secondary' ? 'bg-green-500' : 
                'bg-gray-500'
              }`}></div>
              <span className={`truncate ${overrun ? 'text-red-600 font-bold' : ''}`}>
                {task.text}
              </span>
              <span className={`ml-2 flex-shrink-0 ${overrun ? 'text-red-600 font-bold' : ''}`}>
                {task.completedPomodoros > 0 && (
                  <>
                    {task.completedPomodoros}/
                    {task.type === 'key' && dailyStrategy?.keyTask === task.text && dailyStrategy.keyTaskPomodoros}
                    {task.type === 'secondary' && dailyStrategy?.secondaryTask === task.text && dailyStrategy.secondaryTaskPomodoros}
                    {' 🍅 - '}
                  </>
                )}
                {task.duration}
              </span>
            </div>
          );
        })}
        {sortedTasks.length === 0 && (
          <div className="text-sm text-gray-500">No tasks completed yet</div>
        )}
        {sortedTasks.length > 0 && (
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
