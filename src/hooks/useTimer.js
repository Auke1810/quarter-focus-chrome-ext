import { useState, useEffect } from 'react';

export const useTimer = () => {
  const [timerState, setTimerState] = useState({
    timeLeft: 25 * 60,
    isActive: false,
    isPaused: false,
    isBreak: false
  });
  const [breakEndTime, setBreakEndTime] = useState(null);
  const [reminderTimeout, setReminderTimeout] = useState(null);

  useEffect(() => {
    // Create a long-lived connection to the background service worker
    const port = chrome.runtime.connect({ name: 'timer-port' });

    // Listen for messages from the background service worker
    port.onMessage.addListener((message) => {
      if (message.type === 'STATE_UPDATE') {
        setTimerState(message.state);
        // If transitioning from break to work and timer is not active
        if (!message.state.isBreak && !message.state.isActive) {
          const endTime = Date.now();
          setBreakEndTime(endTime);
          // Set a timeout for 2 minutes
          if (reminderTimeout) {
            clearTimeout(reminderTimeout);
          }
          const timeout = setTimeout(() => {
            try {
              // If timer is still not active after 2 minutes
              if (!timerState.isActive) {
                chrome.runtime.sendMessage({ type: 'PLAY_NOTIFICATION_SOUND' });
              }
            } catch (error) {
              console.error('Failed to play reminder sound:', error);
            }
          }, 2 * 60 * 1000); // 2 minutes
          setReminderTimeout(timeout);
        }
      }
    });

    // Request initial state
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (response) {
        setTimerState(response);
      }
    });

    // Cleanup on unmount
    return () => {
      port.disconnect();
      if (reminderTimeout) {
        clearTimeout(reminderTimeout);
      }
    };
  }, []);

  const handleStart = (currentTask) => {
    if (currentTask.trim() === '') return;
    const startTime = Date.now();
    chrome.storage.local.get(['taskTotalTime'], (result) => {
      chrome.storage.local.set({ 
        taskStartTime: startTime,
        taskTotalTime: result.taskTotalTime || 0,
        completedPomodoros: 0 // Reset pomodoro count when starting a new task
      });
    });
    chrome.runtime.sendMessage({
      type: 'START_TIMER',
      payload: { currentTask, startTime }
    });
  };

  const handlePause = () => {
    chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
  };

  const handleResume = () => {
    const startTime = Date.now();
    chrome.storage.local.get(['taskTotalTime'], (result) => {
      chrome.storage.local.set({ 
        taskStartTime: startTime,
        taskTotalTime: result.taskTotalTime || 0
      });
      chrome.runtime.sendMessage({ type: 'RESUME_TIMER' });
    });
  };

  const handleStop = async (currentTask, dailyStrategy, completedTasks, setCompletedTasks, setCurrentTask) => {
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['taskStartTime', 'taskTotalTime', 'completedPomodoros'], resolve);
    });

    const startTime = result.taskStartTime;
    const currentSessionTime = startTime ? (Date.now() - startTime) : 0;
    const totalTimeSpent = (result.taskTotalTime || 0) + (timerState.isBreak ? 0 : currentSessionTime);
    
    // Calculate if current session completes a pomodoro
    const WORK_TIME_MS = 25 * 60 * 1000; // 25 minutes in milliseconds
    let completedPomodoros = result.completedPomodoros || 0;
    
    // Add a pomodoro if the current session was long enough and wasn't a break
    if (currentSessionTime >= WORK_TIME_MS && !timerState.isBreak) {
      completedPomodoros++;
    }

    // Format duration
    const hours = Math.floor(totalTimeSpent / (1000 * 60 * 60));
    const minutes = Math.floor((totalTimeSpent % (1000 * 60 * 60)) / (1000 * 60));
    const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    chrome.runtime.sendMessage({ type: 'STOP_TIMER' });

    if (currentTask) {
      let taskType = 'rest';
      if (currentTask === dailyStrategy.keyTask) {
        taskType = 'key';
      } else if (currentTask === dailyStrategy.secondaryTask) {
        taskType = 'secondary';
      }
      
      const newTask = {
        text: currentTask,
        duration,
        type: taskType,
        timestamp: new Date().toISOString(),
        completedPomodoros
      };

      const updatedTasks = [...completedTasks, newTask];
      setCompletedTasks(updatedTasks);
      chrome.storage.local.set({ 
        completedTasks: updatedTasks,
        taskTotalTime: 0,
        taskStartTime: null,
        completedPomodoros
      });
      setCurrentTask('');
    }
  };

  return {
    timerState,
    setTimerState,
    breakEndTime,
    handleStart,
    handlePause,
    handleResume,
    handleStop
  };
};
