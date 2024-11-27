import React from 'react';
import { X } from 'lucide-react';
import usePomodoroStore from '../store/pomodoroStore';
import { Task } from '../types';

const TaskArchiveModal: React.FC = () => {
  const { activeModal, closeModal, archivedTasks } = usePomodoroStore();

  if (activeModal !== 'archive') return null;

  const calculateTotalTime = (tasks: Task[]): string => {
    let totalMinutes = 0;
    
    tasks.forEach(task => {
      const duration = task.duration;
      if (duration.includes('h')) {
        const [hours, minutes] = duration.split('h');
        totalMinutes += parseInt(hours) * 60;
        if (minutes) {
          totalMinutes += parseInt(minutes);
        }
      } else {
        totalMinutes += parseInt(duration);
      }
    });
  
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
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
          {archivedTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4" role="status">No archived tasks available</p>
          ) : (
            archivedTasks.map((dayData, dayIndex) => (
              <div key={dayData.date} className="mb-6 last:mb-0">
                <h3 className="text-lg font-medium mb-2">{dayData.date}</h3>
                <div className="space-y-2" role="list">
                  {dayData.tasks.map((task, taskIndex) => (
                    <div 
                      key={`${dayData.date}-${taskIndex}`} 
                      className="flex items-center text-gray-700"
                      role="listitem"
                    >
                      <div 
                        className="w-2 h-2 bg-green-500 rounded-full mr-2"
                        aria-hidden="true"
                      ></div>
                      <span>{task.text} / {task.duration}</span>
                    </div>
                  ))}
                  <div className="pt-2 text-sm text-gray-500">
                    Total time: {calculateTotalTime(dayData.tasks)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskArchiveModal;
