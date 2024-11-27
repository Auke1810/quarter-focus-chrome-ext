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
   * Combines identical tasks and sums their durations
   */
  const combinedTasks = React.useMemo(() => {
    const taskMap = new Map<string, { count: number, totalDuration: string }>();

    completedTasks.forEach(task => {
      const existingTask = taskMap.get(task.text);
      if (existingTask) {
        // Extract minutes from "XX mins" format
        const currentMins = parseInt(task.duration.split(' ')[0]);
        const existingMins = parseInt(existingTask.totalDuration.split(' ')[0]);
        
        taskMap.set(task.text, {
          count: existingTask.count + 1,
          totalDuration: `${currentMins + existingMins} mins`
        });
      } else {
        taskMap.set(task.text, {
          count: 1,
          totalDuration: task.duration
        });
      }
    });

    return Array.from(taskMap.entries()).map(([text, details]) => ({
      text,
      duration: details.totalDuration,
      count: details.count
    }));
  }, [completedTasks]);

  /**
   * Calculates total time spent on all tasks
   */
  const calculateTotalTime = (tasks: PomodoroTask[]): string => {
    const totalMinutes = tasks.reduce((total, task) => {
      const minutes = parseInt(task.duration.split(' ')[0]);
      return total + minutes;
    }, 0);

    if (totalMinutes === 0) return '0 mins';
    return `${totalMinutes} mins`;
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
        Tasks done today ({calculateTotalTime(completedTasks)})
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
            <div className="task-stats text-gray-600 ml-4">
              {task.duration}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedTasks;
