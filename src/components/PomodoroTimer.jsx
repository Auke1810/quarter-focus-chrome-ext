import React, { useState, useEffect } from 'react';
import TaskArchiveModal from './TaskArchiveModal';
import StrategyModal from './StrategyModal';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Timer from './timer/Timer';
import TaskInput from './tasks/TaskInput';
import CompletedTasks from './tasks/CompletedTasks';
import DailyIntention from './strategy/DailyIntention';

const PomodoroTimer = () => {
  const [timerState, setTimerState] = useState({
    timeLeft: 25 * 60,
    isActive: false,
    isPaused: false,
    isBreak: false
  });
  const [completedTasks, setCompletedTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState('');
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [dailyStrategy, setDailyStrategy] = useState({ keyTask: '', secondaryTask: '', dailyIntention: '' });
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [notificationSound, setNotificationSound] = useState(null);
  const [completeSound, setCompleteSound] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [breakEndTime, setBreakEndTime] = useState(null);
  const [reminderTimeout, setReminderTimeout] = useState(null);

  useEffect(() => {
    // Initialize sound with user interaction
    const initializeSound = async () => {
      try {
        console.log('Initializing notification sounds...');
        const notification = new Audio(chrome.runtime.getURL('notification.wav'));
        const complete = new Audio(chrome.runtime.getURL('complete.wav'));
        
        // Set volume to maximum
        notification.volume = 1.0;
        complete.volume = 1.0;
        
        // Set up event listeners for debugging
        const setupAudioListeners = (audio, name) => {
          audio.addEventListener('canplaythrough', () => {
            console.log(`${name} sound loaded and ready to play`);
          });
          
          audio.addEventListener('play', () => {
            console.log(`${name} sound started playing`);
          });
          
          audio.addEventListener('ended', () => {
            console.log(`${name} sound finished playing`);
          });
          
          audio.addEventListener('error', (e) => {
            console.error(`Error with ${name} sound:`, e);
          });
        };

        setupAudioListeners(notification, 'Notification');
        setupAudioListeners(complete, 'Complete');

        // Pre-load both audio files
        await Promise.all([notification.load(), complete.load()]);
        console.log('Sounds loaded successfully');
        
        setNotificationSound(notification);
        setCompleteSound(complete);
      } catch (error) {
        console.error('Sound initialization failed:', error);
      }
    };

    // Initialize sound on user interaction
    const handleUserInteraction = () => {
      if (!notificationSound || !completeSound) {
        initializeSound();
      }
    };

    // Try to initialize on mount
    initializeSound();

    // Also initialize on user interaction as fallback
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      if (reminderTimeout) {
        clearTimeout(reminderTimeout);
      }
    };
  }, []);

  useEffect(() => {
    // Force clear storage and reset on component mount
    const resetStorage = async () => {
      try {
        await new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'CLEAR_STORAGE' }, (response) => {
            if (response && response.success) {
              setCompletedTasks([]);
              setCurrentTask('');
              resolve();
            }
          });
        });
      } catch (error) {
        console.error('Error resetting storage:', error);
      }
    };

    resetStorage();
  }, []);

  useEffect(() => {
    const messageListener = async (message) => {
      if (message.type === 'STATE_UPDATE') {
        setTimerState(message.state);
        // If transitioning from break to work and timer is not active
        if (!message.state.isBreak && !message.state.isActive) {
          const endTime = Date.now();
          setBreakEndTime(endTime);
          // Set a timeout for 2 minutes
          const timeout = setTimeout(async () => {
            try {
              // If timer is still not active after 2 minutes
              if (!timerState.isActive && completeSound) {
                console.log('Playing reminder sound...');
                completeSound.currentTime = 0;
                await completeSound.play();
              }
            } catch (error) {
              console.error('Failed to play reminder sound:', error);
            }
          }, 2 * 60 * 1000); // 2 minutes
          setReminderTimeout(timeout);
        }
      } else if (message.type === 'PLAY_NOTIFICATION_SOUND') {
        console.log('Received play notification sound message');
        
        try {
          if (notificationSound) {
            console.log('Attempting to play sound...');
            notificationSound.currentTime = 0;
            await notificationSound.play();
          } else {
            console.log('No notification sound initialized, trying system notification');
            throw new Error('No notification sound available');
          }
        } catch (error) {
          console.error('Failed to play sound:', error);
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              new Notification('Quarter Focus', {
                body: 'Timer completed!',
                silent: false
              });
            }
          }
        }
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [notificationSound, completeSound, timerState.isActive]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTaskDropdown && !event.target.closest('.task-dropdown-container')) {
        setShowTaskDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTaskDropdown]);

  useEffect(() => {
    // Save current task whenever it changes
    chrome.storage.local.set({ currentTask });
  }, [currentTask]);

  useEffect(() => {
    // Load saved data and check if it's a new day
    const loadSavedData = async () => {
      try {
        const result = await new Promise(resolve => {
          chrome.storage.local.get(['completedTasks', 'lastUpdateDate'], resolve);
        });

        const today = new Date().toDateString();
        const lastUpdateDate = result.lastUpdateDate;

        if (lastUpdateDate !== today) {
          // It's a new day, archive yesterday's tasks if there are any
          if (result.completedTasks && result.completedTasks.length > 0) {
            const archivedTasks = await getArchivedTasks();
            const newArchiveEntry = {
              date: lastUpdateDate || 'Previous Day',
              tasks: result.completedTasks
            };
            const updatedArchive = [newArchiveEntry, ...archivedTasks];
            
            // Save the archived tasks and reset completed tasks
            await new Promise(resolve => {
              chrome.storage.local.set({
                archivedTasks: updatedArchive,
                completedTasks: [],
                lastUpdateDate: today,
                completedPomodoros: 0
              }, resolve);
            });
          } else {
            // Just update the date if there were no tasks
            await new Promise(resolve => {
              chrome.storage.local.set({
                lastUpdateDate: today,
                completedTasks: [],
                completedPomodoros: 0
              }, resolve);
            });
          }
          setCompletedTasks([]);
        } else {
          // Same day, just load the tasks
          setCompletedTasks(result.completedTasks || []);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading saved data:', error);
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, []);

  useEffect(() => {
    // Load daily strategy on component mount
    chrome.storage.local.get(['dailyStrategy', 'currentTask'], (result) => {
      if (result.dailyStrategy && result.dailyStrategy.date === new Date().toLocaleDateString()) {
        setDailyStrategy(result.dailyStrategy);
      }
      if (result.currentTask) {
        setCurrentTask(result.currentTask);
      }
    });

    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (response) {
        setTimerState(response);
      }
    });

    const listener = (message) => {
      if (message.type === 'STATE_UPDATE') {
        setTimerState(message.state);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  // Helper function to get archived tasks
  const getArchivedTasks = async () => {
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['archivedTasks'], resolve);
    });
    return result.archivedTasks || [];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (currentTask.trim() === '') return;
    const startTime = Date.now();
    chrome.storage.local.get(['taskTotalTime'], (result) => {
      chrome.storage.local.set({ 
        taskStartTime: startTime,
        taskTotalTime: result.taskTotalTime || 0 // Initialize if not exists
      });
    });
    chrome.runtime.sendMessage({
      type: 'START_TIMER',
      payload: { currentTask, startTime }
    });
    setTimerState({ ...timerState, isActive: true, isPaused: false });
  };

  const handleResume = () => {
    const startTime = Date.now();
    chrome.storage.local.set({ taskStartTime: startTime });
    chrome.runtime.sendMessage({ type: 'RESUME_TIMER' });
    setTimerState({ ...timerState, isActive: true, isPaused: false });
  };

  const handlePause = () => {
    chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
    setTimerState({ ...timerState, isActive: false, isPaused: true });
  };

  const handleStop = () => {
    chrome.storage.local.get(['taskStartTime', 'taskTotalTime', 'completedPomodoros'], (result) => {
      const startTime = result.taskStartTime;
      const currentSessionTime = Date.now() - startTime;
      const totalTimeSpent = (result.taskTotalTime || 0) + currentSessionTime;
      
      const hours = Math.floor(totalTimeSpent / (1000 * 60 * 60));
      const minutes = Math.floor((totalTimeSpent % (1000 * 60 * 60)) / (1000 * 60));
      
      const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      chrome.runtime.sendMessage({ type: 'STOP_TIMER' });
      setTimerState({ ...timerState, isActive: false, isPaused: false });

      if (currentTask) {
        let taskType = 'rest';
        if (currentTask === dailyStrategy.keyTask) {
          taskType = 'key';
        } else if (currentTask === dailyStrategy.secondaryTask) {
          taskType = 'secondary';
        }

        // Get the number of completed Pomodoros for this task
        const completedPomodoros = !timerState.isBreak ? (result.completedPomodoros || 0) + 1 : (result.completedPomodoros || 0);
        
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
          completedPomodoros: 0, // Reset for next task
          taskTotalTime: 0 // Reset total time for next task
        });
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

  const handleTaskSelect = (taskType) => {
    if (taskType === 'key') {
      setCurrentTask(dailyStrategy.keyTask);
    } else if (taskType === 'secondary') {
      setCurrentTask(dailyStrategy.secondaryTask);
    }
  };

  if (isLoading) {
    return (
      <div className="min-w-[300px] w-full max-w-[800px] min-h-[400px] h-full max-h-[800px] flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-w-[300px] w-full max-w-[800px] min-h-[400px] h-full max-h-[800px] flex flex-col bg-white">
      <Header />

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4 md:p-6 flex flex-col h-full">
          <DailyIntention intention={dailyStrategy.dailyIntention} />
          
          <Timer 
            timerState={timerState}
            currentTask={currentTask}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            formatTime={formatTime}
          />

          <TaskInput 
            currentTask={currentTask}
            showTaskDropdown={showTaskDropdown}
            dailyStrategy={dailyStrategy}
            onTaskChange={setCurrentTask}
            onTaskFocus={() => setShowTaskDropdown(true)}
            onTaskSelect={(task) => {
              setCurrentTask(task);
              setShowTaskDropdown(false);
            }}
          />

          <CompletedTasks 
            completedTasks={completedTasks}
            calculateTotalTime={calculateTotalTime}
          />
        </div>
      </div>

      <Footer 
        onStrategyClick={() => setIsStrategyModalOpen(true)}
        onHistoryClick={async () => {
          const archived = await getArchivedTasks();
          setArchivedTasks(archived);
          setIsArchiveModalOpen(true);
        }}
      />

      <TaskArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        archivedTasks={archivedTasks}
      />

      <StrategyModal 
        isOpen={isStrategyModalOpen} 
        onClose={() => setIsStrategyModalOpen(false)}
        onSave={(strategy) => {
          setDailyStrategy(strategy);
          if (!currentTask && (strategy.keyTask || strategy.secondaryTask)) {
            setCurrentTask(strategy.keyTask || strategy.secondaryTask);
          }
        }}
      />
    </div>
  );
};

export default PomodoroTimer;