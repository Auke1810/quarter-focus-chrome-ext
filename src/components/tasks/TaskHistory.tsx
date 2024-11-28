import React from 'react';
import usePomodoroStore from '../../store/pomodoroStore';
import { PomodoroTask } from '../../types';

/**
 * TaskHistory Component
 * Displays archived tasks grouped by date
 */
const TaskHistory: React.FC = () => {
  const { archivedTasks } = usePomodoroStore();

  /**
   * Formats minutes into hours and minutes string (e.g., "1h15m")
   */
  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h${remainingMinutes}m`;
  };

  /**
   * Parses duration from either string ("25 mins") or number format
   */
  const parseDuration = (duration: string | number): number => {
    if (typeof duration === 'number') return duration;
    return parseInt(duration.split(' ')[0]) || 0;
  };

  /**
   * Formats date to a readable string
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Combines identical tasks for a given day
   */
  const combineTasksForDay = (tasks: PomodoroTask[]) => {
    const taskMap = new Map<string, { count: number, totalDuration: number, pomodoroCount: number }>();

    tasks.forEach(task => {
      const existingTask = taskMap.get(task.text);
      const pomodoroCount = task.pomodoroCount || 0;
      const duration = parseDuration(task.duration);

      if (existingTask) {
        taskMap.set(task.text, {
          count: existingTask.count + 1,
          totalDuration: existingTask.totalDuration + duration,
          pomodoroCount: existingTask.pomodoroCount + pomodoroCount
        });
      } else {
        taskMap.set(task.text, {
          count: 1,
          totalDuration: duration,
          pomodoroCount: pomodoroCount
        });
      }
    });

    return Array.from(taskMap.entries()).map(([text, details]) => ({
      text,
      duration: formatDuration(details.totalDuration),
      count: details.count,
      pomodoroCount: details.pomodoroCount
    }));
  };

  /**
   * Calculates day totals
   */
  const calculateDayTotals = (tasks: PomodoroTask[]) => {
    const totalMinutes = tasks.reduce((total, task) => total + parseDuration(task.duration), 0);
    const totalPomodoros = tasks.reduce((total, task) => total + (task.pomodoroCount || 0), 0);
    return {
      time: formatDuration(totalMinutes),
      pomodoros: totalPomodoros
    };
  };

  if (!archivedTasks.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-300">
        No task history available
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="task-history-container flex-1 overflow-y-auto space-y-6">
        {archivedTasks.map((day, dayIndex) => {
          const combinedTasks = combineTasksForDay(day.tasks);
          const totals = calculateDayTotals(day.tasks);

          return (
            <div key={dayIndex} className="day-group">
              <div className="text-sm font-medium text-gray-200 mb-2">
                {formatDate(day.date)} ({totals.pomodoros}/{totals.time})
              </div>
              <div className="space-y-2">
                {combinedTasks.map((task, taskIndex) => (
                  <div 
                    key={taskIndex}
                    className="task-row bg-white bg-opacity-5 border border-gray-700 p-3 flex justify-between items-center"
                    role="listitem"
                  >
                    <div className="task-title text-gray-300 flex-1">
                      {task.text}
                      {task.count > 1 && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({task.count}×)
                        </span>
                      )}
                    </div>
                    <div className="task-stats text-gray-400 ml-4 flex items-center gap-2">
                      <span>{task.pomodoroCount}/{task.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskHistory;
