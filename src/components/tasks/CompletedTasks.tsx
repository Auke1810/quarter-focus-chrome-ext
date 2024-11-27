import React from 'react';
import usePomodoroStore from '../../store/pomodoroStore';
import { PomodoroTask } from '../../types';

/**
 * CompletedTasks Component
 * Displays a list of completed tasks for the current day
 */
const CompletedTasks: React.FC = () => {
  const { completedTasks } = usePomodoroStore();

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
   * Combines identical tasks and sums their durations and pomodoro counts
   */
  const combinedTasks = React.useMemo(() => {
    const taskMap = new Map<string, { count: number, totalDuration: number, pomodoroCount: number }>();

    completedTasks.forEach(task => {
      const existingTask = taskMap.get(task.text);
      const pomodoroCount = task.pomodoroCount || 1;
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
  }, [completedTasks]);

  /**
   * Calculates total time spent on all tasks
   */
  const calculateTotalTime = (tasks: PomodoroTask[]): string => {
    const totalMinutes = tasks.reduce((total, task) => total + parseDuration(task.duration), 0);
    return formatDuration(totalMinutes);
  };

  /**
   * Calculates total pomodoro count
   */
  const calculateTotalPomodoros = (): number => {
    return completedTasks.reduce((total, task) => total + (task.pomodoroCount || 1), 0);
  };

  if (!completedTasks.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-300">
        No completed tasks yet
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="text-sm font-medium text-gray-200 mb-2">
        Tasks done today ({calculateTotalPomodoros()}/{calculateTotalTime(completedTasks)})
      </div>
      <div className="completed-tasks-container flex-1 overflow-y-auto">
        {combinedTasks.map((task, index) => (
          <div 
            key={index}
            className="task-row bg-white border border-gray-200 p-3 flex justify-between items-center"
            role="listitem"
          >
            <div className="task-title text-gray-800 flex-1">
              {task.text}
              {task.count > 1 && (
                <span className="ml-2 text-sm text-gray-500">
                  ({task.count}×)
                </span>
              )}
            </div>
            <div className="task-stats text-gray-600 ml-4 flex items-center gap-2">
              <span>{task.pomodoroCount}/{task.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedTasks;
