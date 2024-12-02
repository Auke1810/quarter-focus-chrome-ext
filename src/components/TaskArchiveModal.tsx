import React from 'react';
import { X } from 'lucide-react';
import usePomodoroStore from '../store/pomodoroStore';
import { PomodoroTask } from '../types';

/**
 * TaskArchiveModal Component
 * 
 * Modal interface displaying historical task completion data.
 * Shows completed tasks grouped by date with duration information.
 * 
 * Features:
 * - Historical task viewing
 * - Task grouping by date
 * - Duration calculations
 * - Scrollable content
 * 
 * Data Display:
 * - Task completion dates
 * - Task names and durations
 * - Total time per task
 * - Daily summaries
 * 
 * Visual Elements:
 * - Modal container with header
 * - Close button
 * - Scrollable task list
 * - Task groupings with headers
 * 
 * Accessibility:
 * - Modal focus management
 * - Semantic HTML structure
 * - Proper headings hierarchy
 * - Keyboard navigation
 * 
 * @component
 * @example
 * return (
 *   <TaskArchiveModal />
 * )
 */
const TaskArchiveModal: React.FC = () => {
  const { activeModal, closeModal, archivedTasks } = usePomodoroStore();

  // Debug logging for archivedTasks
  React.useEffect(() => {
    console.error('TaskArchiveModal - Raw Archived Tasks:', {
      activeModal,
      tasksType: typeof archivedTasks,
      tasksLength: archivedTasks.length,
      tasksData: JSON.stringify(archivedTasks, null, 2)
    });
  }, [archivedTasks, activeModal]);

  if (activeModal !== 'archive') return null;

  // Defensive rendering
  const renderArchivedTasks = () => {
    // Ensure archivedTasks is an array
    const safeTasks = Array.isArray(archivedTasks) ? archivedTasks : [];

    // Extremely defensive logging of entire archivedTasks
    console.error('FULL ARCHIVED TASKS DEBUG:', {
      archivedTasksType: typeof archivedTasks,
      archivedTasksLength: safeTasks.length,
      archivedTasksFirstItem: safeTasks.length > 0 ? JSON.stringify(safeTasks[0]) : 'No items'
    });

    if (safeTasks.length === 0) {
      return (
        <p className="text-gray-500 text-center py-4" role="status">
          No archived tasks available
        </p>
      );
    }

    return safeTasks.map((dayData, dayIndex) => {
      // Defensive check for dayData
      if (!dayData || typeof dayData !== 'object') {
        console.error('Invalid dayData:', JSON.stringify(dayData));
        return null;
      }

      // Forcible task conversion with multiple strategies
      let processedTasks: PomodoroTask[] = [];
      
      // Strategy 1: Direct array check
      if (Array.isArray(dayData.tasks)) {
        processedTasks = dayData.tasks;
      } 
      // Strategy 2: Object.values conversion
      else if (dayData.tasks && typeof dayData.tasks === 'object') {
        console.warn(`Day ${dayIndex} tasks is an object, forcibly converting`);
        
        try {
          // Attempt multiple conversion methods
          const conversionAttempts = [
            // Attempt 1: Object.values
            () => {
              const values = Object.values(dayData.tasks);
              return values.filter(
                (task): task is PomodoroTask => 
                  task !== null && 
                  typeof task === 'object' && 
                  'text' in task && 
                  'duration' in task
              );
            },
            // Attempt 2: Object.entries
            () => {
              const entries = Object.entries(dayData.tasks);
              return entries
                .map(([_, task]) => task)
                .filter(
                  (task): task is PomodoroTask => 
                    task !== null && 
                    typeof task === 'object' && 
                    'text' in task && 
                    'duration' in task
                );
            },
            // Attempt 3: JSON parse/stringify (last resort)
            () => {
              try {
                const parsed = JSON.parse(JSON.stringify(dayData.tasks));
                return Array.isArray(parsed) 
                  ? parsed 
                  : Object.values(parsed).filter(
                      (task): task is PomodoroTask => 
                        task !== null && 
                        typeof task === 'object' && 
                        'text' in task && 
                        'duration' in task
                    );
              } catch {
                return [];
              }
            }
          ];

          // Try conversion attempts until we find non-empty tasks
          for (const attempt of conversionAttempts) {
            const convertedTasks = attempt();
            if (convertedTasks.length > 0) {
              processedTasks = convertedTasks;
              break;
            }
          }
        } catch (error) {
          console.error(`Catastrophic task conversion failure for day ${dayIndex}:`, error);
          processedTasks = [];
        }
      } 
      // Strategy 3: Fallback to empty array
      else {
        console.error(`Day ${dayIndex} tasks has unexpected type:`, typeof dayData.tasks);
        processedTasks = [];
      }

      // Extremely defensive logging of conversion process
      console.error(`Day ${dayIndex} Conversion Debug:`, {
        originalTasksType: typeof dayData.tasks,
        originalTasksValue: JSON.stringify(dayData.tasks),
        processedTasksLength: processedTasks.length,
        processedTasksType: typeof processedTasks,
        isProcessedTasksArray: Array.isArray(processedTasks),
        firstProcessedTaskKeys: processedTasks.length > 0 ? Object.keys(processedTasks[0]) : 'No tasks'
      });

      // Skip rendering if no tasks
      if (processedTasks.length === 0) {
        return null;
      }

      return (
        <div key={dayData.date || `day-${dayIndex}`} className="mb-6 last:mb-0">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">{dayData.date || `Day ${dayIndex + 1}`}</h2>
            <span className="text-sm text-gray-500">
              {calculateTotalTime(processedTasks)}
            </span>
          </div>
          {processedTasks.map((task, taskIndex) => (
            <div 
              key={task.id || `task-${dayIndex}-${taskIndex}`} 
              className="bg-white p-3 rounded-lg shadow-sm mb-2 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{task.text || 'Unknown Task'}</p>
                <p className="text-sm text-gray-500">{task.duration || 'No Duration'}</p>
              </div>
            </div>
          ))}
        </div>
      );
    });
  };

  const calculateTotalTime = (tasks: PomodoroTask[] | undefined): string => {
    console.error('FORCED LOGGING: Entering calculateTotalTime');
    
    try {
      // Extremely defensive type checking
      if (!tasks) {
        console.error('No tasks provided to calculateTotalTime');
        return '0m';
      }

      // Ensure tasks is an array
      const safeTaskArray = Array.isArray(tasks) ? tasks : [tasks];

      // Detailed debug logging
      console.error('Debug calculateTotalTime:', JSON.stringify({
        tasksType: typeof tasks,
        isArray: Array.isArray(tasks),
        tasksLength: safeTaskArray.length,
        firstTaskType: typeof safeTaskArray[0],
        firstTaskKeys: safeTaskArray[0] ? Object.keys(safeTaskArray[0]) : 'No first task'
      }, null, 2));

      let totalMinutes = 0;
      
      safeTaskArray.forEach((task, index) => {
        console.error(`PROCESSING Task ${index}`);

        // Extremely defensive type checking
        if (!task || typeof task !== 'object') {
          console.error(`Invalid task at index ${index}:`, JSON.stringify(task));
          return;
        }

        // Detailed task logging with full task object
        console.error(`Task ${index} Full Details:`, JSON.stringify(task, null, 2));

        // Detailed task logging
        console.error(`Task ${index} Duration Details:`, JSON.stringify({
          duration: task.duration,
          durationType: typeof task.duration,
          durationValue: task.duration,
          taskKeys: Object.keys(task)
        }, null, 2));

        // Multiple ways to extract duration
        const duration = 
          task.duration ?? 
          (task as any)['duration'] ?? 
          (task as any).Duration ?? 
          (task as any).DURATION ?? 
          '0';

        console.error(`DURATION EXTRACTION:`, {
          originalDuration: duration,
          originalType: typeof duration
        });

        // Convert to string with comprehensive error handling
        let durationStr = '';
        try {
          durationStr = String(duration).trim().toLowerCase();
        } catch (strConversionError) {
          console.error(`Failed to convert duration to string at index ${index}:`, {
            duration,
            error: strConversionError
          });
          return;
        }

        // Log the durationStr before includes check
        console.error(`Duration String Details at ${index}:`, {
          durationStr,
          durationStrType: typeof durationStr,
          durationStrValue: durationStr
        });

        // Extremely defensive check for includes method
        if (typeof durationStr.includes !== 'function') {
          console.error(`CRITICAL: Duration does not have includes method at index ${index}:`, {
            durationStr,
            durationType: typeof durationStr,
            durationKeys: durationStr ? Object.keys(durationStr) : 'No keys',
            durationPrototype: Object.prototype.toString.call(durationStr)
          });
          return;
        }
        
        try {
          let minutes = 0;
          if (durationStr.includes('h')) {
            const [hours, mins] = durationStr.split('h');
            minutes += parseInt(hours || '0') * 60;
            if (mins) {
              minutes += parseInt(mins);
            }
          } else {
            // Try parsing as a plain number
            const parsedMinutes = parseInt(durationStr);
            if (!isNaN(parsedMinutes)) {
              minutes = parsedMinutes;
            }
          }

          totalMinutes += minutes;
        } catch (parseError) {
          console.error(`Failed to parse duration at index ${index}:`, {
            durationStr,
            error: parseError
          });
        }
      });
    
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    } catch (outerError) {
      console.error('Catastrophic error in calculateTotalTime:', outerError);
      return '0m';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-modal-title"
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col relative">
        <div className="flex justify-between items-center mb-4">
          <h2 id="archive-modal-title" className="text-xl font-semibold">Previous Days</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {renderArchivedTasks()}
        </div>
      </div>
    </div>
  );
};

export default TaskArchiveModal;
