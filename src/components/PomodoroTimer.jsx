import React, { useState, useEffect } from 'react';
import { Pause } from 'lucide-react';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (response) {
        setTimeLeft(response.timeLeft);
        setIsActive(response.isActive);
        setIsPaused(response.isPaused);
        setCurrentTask(response.currentTask || '');
      }
      setIsLoading(false);
    });

    chrome.storage.local.get(['completedTasks', 'lastUpdateDate'], (result) => {
      const today = new Date().toDateString();
      if (result.lastUpdateDate !== today) {
        chrome.storage.local.set({ 
          completedTasks: [],
          lastUpdateDate: today
        });
      } else if (result.completedTasks) {
        setCompletedTasks(result.completedTasks);
      }
    });

    const listener = (message) => {
      if (message.type === 'STATE_UPDATE') {
        setTimeLeft(message.state.timeLeft);
        setIsActive(message.state.isActive);
        setIsPaused(message.state.isPaused);
        setIsBreak(message.state.isBreak);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (currentTask.trim() === '') return;
    const startTime = Date.now();
    chrome.storage.local.set({ taskStartTime: startTime });
    chrome.runtime.sendMessage({
      type: 'START_TIMER',
      payload: { currentTask, startTime }
    });
    setIsActive(true);
    setIsPaused(false);
  };

  const handleResume = () => {
    chrome.runtime.sendMessage({ type: 'RESUME_TIMER' });
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
    setIsActive(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    chrome.storage.local.get(['taskStartTime'], (result) => {
      const startTime = result.taskStartTime;
      const endTime = Date.now();
      const timeSpent = endTime - startTime;
      const hours = Math.floor(timeSpent / (1000 * 60 * 60));
      const minutes = Math.floor((timeSpent % (1000 * 60 * 60)) / (1000 * 60));
      
      const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      chrome.runtime.sendMessage({ type: 'STOP_TIMER' });
      setIsActive(false);
      setIsPaused(false);

      if (currentTask) {
        const newTask = {
          text: currentTask,
          duration,
          timestamp: new Date().toLocaleDateString()
        };
        const updatedTasks = [...completedTasks, newTask];
        setCompletedTasks(updatedTasks);
        chrome.storage.local.set({ completedTasks: updatedTasks });
        setCurrentTask('');
      }
    });
  };
  
  const calculateTotalTime = (tasks) => {
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

  if (isLoading) {
    return (
      <div className="w-96 h-96 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-white flex flex-col">
      <header style={{backgroundColor: '#15243D'}} className="p-3">
        <h1 className="text-white text-lg">Quarter Focus: Only today</h1>
      </header>

      <div className="flex-grow p-6 flex flex-col">
        <div className="text-center mb-8 relative flex-shrink-0">
          <div className="text-6xl font-bold mb-4 font-mono">
            {formatTime(timeLeft)}
            {isActive && !isPaused && (
              <button
                onClick={handlePause}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            placeholder="Enter your task..."
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isActive && !isPaused}
          />
          {!isActive && !isPaused ? (
            <button
              onClick={handleStart}
              className="bg-blue-500 text-white px-6 py-2 rounded flex items-center whitespace-nowrap"
              disabled={!currentTask}
            >
              Start
            </button>
          ) : isPaused ? (
            <button
              onClick={handleResume}
              className="bg-green-500 text-white px-6 py-2 rounded flex items-center whitespace-nowrap"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="bg-orange-500 text-white px-6 py-2 rounded flex items-center whitespace-nowrap"
            >
              stop
            </button>
          )}
        </div>

        <div className="flex-grow overflow-auto">
          <h2 className="text-lg font-semibold mb-3">Tasks done today</h2>
          <div className="space-y-2">
            {completedTasks.map((task, index) => (
              <div key={index} className="flex items-center text-gray-700">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>{task.text} / {task.duration}</span>
              </div>
            ))}
            {completedTasks.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Total time today:</span>
                  <span>{calculateTotalTime(completedTasks)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;