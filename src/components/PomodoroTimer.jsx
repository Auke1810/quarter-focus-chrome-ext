import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import TaskArchiveModal from './TaskArchiveModal';
import StrategyModal from './StrategyModal';

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
  const [dailyStrategy, setDailyStrategy] = useState({ keyTask: '', secondaryTask: '' });
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
    // Load daily strategy on component mount
    chrome.storage.local.get(['dailyStrategy'], (result) => {
      if (result.dailyStrategy && result.dailyStrategy.date === new Date().toLocaleDateString()) {
        setDailyStrategy(result.dailyStrategy);
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
          dailyStrategy: { date: today } // Reset strategy but keep date updated
        });
        setCompletedTasks([]);
        setDailyStrategy({ date: today }); // Reset strategy in state
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
      <header style={{backgroundColor: '#15243D'}} className="p-2 sm:p-3 flex-shrink-0">
        <h1 className="text-white text-base sm:text-lg">Quarter Focus: Only today</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4 md:p-6 flex flex-col h-full">
          <div className="text-center mb-4 sm:mb-6">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
              {formatTime(timerState.timeLeft)}
            </div>
            <div className={`text-sm font-medium ${timerState.isBreak ? 'text-green-600' : 'text-blue-600'}`}>
              {timerState.isBreak ? 'Break Time' : 'Focus Time'}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Current Task
            </label>
            <div className="relative task-dropdown-container">
              <input
                type="text"
                value={currentTask}
                onChange={(e) => {
                  setCurrentTask(e.target.value);
                }}
                onFocus={() => setShowTaskDropdown(true)}
                placeholder="What are you working on?"
                className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showTaskDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[200px] overflow-y-auto">
                  {dailyStrategy.keyTask && (
                    <button
                      onClick={() => {
                        setCurrentTask(dailyStrategy.keyTask);
                        setShowTaskDropdown(false);
                      }}
                      className="w-full p-2 text-left hover:bg-gray-100 flex items-center text-sm sm:text-base"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="font-medium truncate">Key: {dailyStrategy.keyTask}</span>
                    </button>
                  )}
                  {dailyStrategy.secondaryTask && (
                    <button
                      onClick={() => {
                        setCurrentTask(dailyStrategy.secondaryTask);
                        setShowTaskDropdown(false);
                      }}
                      className="w-full p-2 text-left hover:bg-gray-100 flex items-center text-sm sm:text-base"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="font-medium truncate">Secondary: {dailyStrategy.secondaryTask}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-6">
            {!timerState.isActive && !timerState.isPaused ? (
              <button
                onClick={handleStart}
                disabled={!currentTask}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md flex items-center text-sm sm:text-base ${
                  currentTask
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="whitespace-nowrap">Start Timer</span>
              </button>
            ) : timerState.isPaused ? (
              <button
                onClick={handleResume}
                className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm sm:text-base"
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="whitespace-nowrap">Resume</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center text-sm sm:text-base"
                >
                  <Pause className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="whitespace-nowrap">Pause</span>
                </button>
                <button
                  onClick={handleStop}
                  className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center text-sm sm:text-base"
                >
                  <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="whitespace-nowrap">Stop</span>
                </button>
              </>
            )}
          </div>

          <div className="flex-1 min-h-0">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Tasks done today</h2>
            <div className="space-y-1.5 sm:space-y-2 overflow-y-auto max-h-full">
              {completedTasks.map((task, index) => (
                <div key={index} className="flex items-center text-sm sm:text-base text-gray-700">
                  <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                    task.type === 'key' ? 'bg-blue-500' : 
                    task.type === 'secondary' ? 'bg-green-500' : 
                    'bg-gray-500'
                  }`}></div>
                  <span className="truncate">{task.text}</span>
                  <span className="ml-2 flex-shrink-0">/ {task.duration}</span>
                </div>
              ))}
              {completedTasks.length === 0 && (
                <div className="text-sm text-gray-500">No tasks completed yet</div>
              )}
              {completedTasks.length > 0 && (
                <div className="pt-3 mt-3 sm:pt-4 sm:mt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm sm:text-base text-gray-700">
                    <span>Total time today:</span>
                    <span>{calculateTotalTime(completedTasks)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer style={{backgroundColor: '#15243D'}} className="p-2 sm:p-3 flex-shrink-0">
        <nav className="flex justify-between items-center">
          <a 
            href="https://www.quarterfocus.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white hover:text-gray-300 text-sm sm:text-base"
          >
            Quarter Focus
          </a>
          <div className="flex gap-3 sm:gap-4">
            <button
              onClick={() => setIsStrategyModalOpen(true)}
              className="text-white hover:text-gray-300 text-sm sm:text-base whitespace-nowrap"
            >
              Strategy
            </button>
            <button
              onClick={async () => {
                const archived = await getArchivedTasks();
                setArchivedTasks(archived);
                setIsArchiveModalOpen(true);
              }}
              className="text-white hover:text-gray-300 text-sm sm:text-base whitespace-nowrap"
            >
              History
            </button>
          </div>
        </nav>
      </footer>

      <TaskArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        archivedTasks={archivedTasks}
      />

      <StrategyModal
        isOpen={isStrategyModalOpen}
        onClose={() => setIsStrategyModalOpen(false)}
      />
    </div>
  );
};

export default PomodoroTimer;