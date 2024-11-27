/// <reference types="chrome"/>

// Chrome types
type WindowOptions = {
  url: string;
  width?: number;
  height?: number;
  type?: chrome.windows.WindowType;
};

type TimerState = {
  timeLeft: number;
  isActive: boolean;
  isPaused: boolean;
  isBreak: boolean;
};

// Constants
const POPUP_URL = chrome.runtime.getURL('index.html');
const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 600;
const WORK_TIME = 25 * 60; // 25 minutes
const SHORT_BREAK = 5 * 60; // 5 minutes

// Timer state
let timerState: TimerState = {
  timeLeft: WORK_TIME,
  isActive: false,
  isPaused: false,
  isBreak: false
};

let timerInterval: number | null = null;

// Keep track of active ports
let ports: chrome.runtime.Port[] = [];

// Service worker activation
self.addEventListener('activate', (event) => {
  // Claim control immediately
  event.waitUntil(clients.claim());
});

// Connect to ports
chrome.runtime.onConnect.addListener((port) => {
  ports.push(port);
  port.onDisconnect.addListener(() => {
    ports = ports.filter(p => p !== port);
  });
});

// Safe message sending function
const sendMessageToAllPorts = (message: any) => {
  ports.forEach(port => {
    try {
      port.postMessage(message);
    } catch (error) {
      console.error('Error sending message to port:', error);
    }
  });
};

// Timer functions
const startTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerState = {
    ...timerState,
    isActive: true,
    isPaused: false
  };

  timerInterval = window.setInterval(() => {
    if (timerState.timeLeft > 0 && !timerState.isPaused) {
      timerState = {
        ...timerState,
        timeLeft: timerState.timeLeft - 1
      };

      // Send updated state to all connected ports
      sendMessageToAllPorts({
        type: 'TIMER_UPDATE',
        state: timerState
      });

      // Check if timer completed
      if (timerState.timeLeft === 0) {
        if (timerInterval) {
          clearInterval(timerInterval);
        }

        // Play notification sound
        const audio = new Audio(chrome.runtime.getURL('notification.wav'));
        audio.play().catch(console.error);

        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: timerState.isBreak ? 'Break Complete!' : 'Focus Session Complete!',
          message: timerState.isBreak ? 'Ready to focus?' : 'Time for a break!'
        });

        // Toggle break state
        timerState = {
          ...timerState,
          isActive: false,
          isBreak: !timerState.isBreak,
          timeLeft: timerState.isBreak ? WORK_TIME : SHORT_BREAK
        };

        sendMessageToAllPorts({
          type: 'TIMER_COMPLETE',
          state: timerState
        });
      }
    }
  }, 1000);
};

const pauseTimer = () => {
  timerState = {
    ...timerState,
    isPaused: true
  };

  sendMessageToAllPorts({
    type: 'TIMER_PAUSE',
    state: timerState
  });
};

const resumeTimer = () => {
  timerState.isPaused = false;
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  timerState = {
    timeLeft: WORK_TIME,
    isActive: false,
    isPaused: false,
    isBreak: false
  };

  sendMessageToAllPorts({
    type: 'TIMER_STOP',
    state: timerState
  });
};

// Check if window exists
const windowExists = async (url: string): Promise<boolean> => {
  const windows = await chrome.windows.getAll({ populate: true });
  return windows.some(window => 
    window.tabs?.some(tab => 
      tab.url === url
    )
  );
};

// Create window
const createWindow = async (options: WindowOptions): Promise<chrome.windows.Window> => {
  const { url, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, type = 'popup' } = options;
  
  return chrome.windows.create({
    url,
    width,
    height,
    type,
    focused: true
  });
};

// Handle extension icon click
chrome.action.onClicked.addListener(async () => {
  try {
    const exists = await windowExists(POPUP_URL);
    
    if (!exists) {
      await createWindow({
        url: POPUP_URL,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT
      });
    }
  } catch (error) {
    console.error('Error handling action click:', error);
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_TIMER':
      startTimer();
      break;
    case 'PAUSE_TIMER':
      pauseTimer();
      break;
    case 'RESUME_TIMER':
      resumeTimer();
      break;
    case 'STOP_TIMER':
      stopTimer();
      break;
    case 'GET_TIMER_STATE':
      sendResponse(timerState);
      break;
  }
  return true;
});
