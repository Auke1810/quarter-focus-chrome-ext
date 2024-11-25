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
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);

  useEffect(() => {
    // Initialize sound with user interaction
    const initializeSound = async () => {
      try {
        console.log('Initializing notification sound...');
        const audio = new Audio(chrome.runtime.getURL('notification.wav'));
        
        // Set volume to maximum
        audio.volume = 1.0;
        
        // Set up event listeners for debugging
        audio.addEventListener('canplaythrough', () => {
          console.log('Sound loaded and ready to play');
        });
        
        audio.addEventListener('play', () => {
          console.log('Sound started playing');
        });
        
        audio.addEventListener('ended', () => {
          console.log('Sound finished playing');
        });
        
        audio.addEventListener('error', (e) => {
          console.error('Error with sound:', e);
        });

        // Pre-load the audio
        await audio.load();
        console.log('Sound loaded successfully');
        
        setNotificationSound(audio);
      } catch (error) {
        console.error('Sound initialization failed:', error);
      }
    };

    // Initialize sound on user interaction
    const handleUserInteraction = () => {
      if (!notificationSound) {
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
    };
  }, []);

  useEffect(() => {
    const messageListener = async (message) => {
      if (message.type === 'STATE_UPDATE') {
        setTimerState(message.state);
      } else if (message.type === 'PLAY_NOTIFICATION_SOUND') {
        console.log('Received play notification sound message');
        
        try {
          if (notificationSound) {
            console.log('Attempting to play sound...');
            
            // Reset the audio to start
            notificationSound.currentTime = 0;
            notificationSound.volume = 1.0;
            
            // Play the sound
            const playPromise = notificationSound.play();
            if (playPromise) {
              await playPromise;
              console.log('Sound started playing');
            }
          } else {
            console.log('No notification sound initialized, trying system notification');
            throw new Error('No notification sound available');
          }
        } catch (error) {
          console.error('Failed to play sound:', error);
          // Fallback to system notification
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
  }, [notificationSound]);

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
    // Clear current task at the start of a new day
    chrome.storage.local.get(['lastUpdateDate'], (result) => {
      const today = new Date().toDateString();
      if (result.lastUpdateDate !== today) {
        chrome.storage.local.set({ currentTask: '' });
        setCurrentTask('');
      }
    });
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
      setIsLoading(false);
    });

    chrome.storage.local.get(['completedTasks', 'lastUpdateDate', 'archivedTasks', 'dailyStrategy'], (result) => {
      const today = new Date().toDateString();
      if (result.lastUpdateDate !== today) {
        // Archive yesterday's tasks before clearing
        const archivedTasks = result.archivedTasks || [];
        if (result.completedTasks && result.completedTasks.length > 0) {
          archivedTasks.unshift({
            date: result.lastUpdateDate || new Date(Date.now() - 86400000).toDateString(),
            tasks: result.completedTasks
          });
          
          // Keep only last 30 days of archives
          if (archivedTasks.length > 30) {
            archivedTasks.pop();
          }
        }
        
        // Clear both completed tasks and daily strategy for the new day
        chrome.storage.local.set({ 
          completedTasks: [],
          lastUpdateDate: today,
          archivedTasks: archivedTasks,
          dailyStrategy: { date: today }, // Reset strategy but keep date updated
          currentTask: '' // Clear current task
        });
        setCompletedTasks([]);
        setDailyStrategy({ date: today }); // Reset strategy in state
        setCurrentTask(''); // Reset current task in state
      } else {
        // It's still the same day, load existing data
        if (result.completedTasks) {
          setCompletedTasks(result.completedTasks);
        }
        if (result.dailyStrategy) {
          setDailyStrategy(result.dailyStrategy);
        }
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
    setTimerState({ ...timerState, isActive: true, isPaused: false });
  };

  const handleResume = () => {
    chrome.runtime.sendMessage({ type: 'RESUME_TIMER' });
    setTimerState({ ...timerState, isActive: true, isPaused: false });
  };

  const handlePause = () => {
    chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
    setTimerState({ ...timerState, isActive: false, isPaused: true });
  };

  const handleStop = () => {
    chrome.storage.local.get(['taskStartTime'], (result) => {
      const startTime = result.taskStartTime;
      const timeSpent = Date.now() - startTime;
      const hours = Math.floor(timeSpent / (1000 * 60 * 60));
      const minutes = Math.floor((timeSpent % (1000 * 60 * 60)) / (1000 * 60));
      
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

        const newTask = {
          text: currentTask,
          duration,
          type: taskType,
          timestamp: new Date().toISOString()
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

  const getArchivedTasks = async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['archivedTasks'], (result) => {
        resolve(result.archivedTasks || []);
      });
    });
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