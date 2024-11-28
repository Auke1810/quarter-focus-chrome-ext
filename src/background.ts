/// <reference types="chrome"/>
import { TimerStateInterface } from './types';

// Service worker types
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

interface Client {
  id: string;
  type: 'window' | 'worker' | 'sharedworker' | 'all';
  url: string;
  claim(): Promise<void>;
}

interface Clients {
  claim(): Promise<void>;
  get(id: string): Promise<Client | undefined>;
  matchAll(options?: { includeUncontrolled?: boolean; type?: Client['type'] }): Promise<Client[]>;
}

interface ServiceWorkerGlobalScope {
  clients: Clients;
  addEventListener(type: string, listener: (event: ExtendableEvent) => void): void;
}

// Constants
const POPUP_URL = chrome.runtime.getURL('index.html');
const DEFAULT_WIDTH   = 400;
const DEFAULT_HEIGHT  = 600;
const FOCUS_TIME      = 25 * 60; // 25 minutes (25 * 60 seconds)
const BREAK_TIME      = 5 * 60; // 5 minutes (5 * 60 seconds)

// Timer state
let timerState: TimerStateInterface = {
  timeLeft: FOCUS_TIME,
  isRunning: false,
  isPaused: false,
  currentPhase: 'focus'
};

let timerInterval: ReturnType<typeof setInterval> | null = null;

// Keep track of active ports
const ports: chrome.runtime.Port[] = [];

// Service worker activation
declare const self: ServiceWorkerGlobalScope;
self.addEventListener('activate', (event) => {
  // Claim control immediately
  event.waitUntil(self.clients.claim());
});

// Connect to ports
chrome.runtime.onConnect.addListener((port) => {
  ports.push(port);
  port.onDisconnect.addListener(() => {
    const index = ports.indexOf(port);
    if (index > -1) {
      ports.splice(index, 1);
    }
  });
});

// Send message to all connected ports
const sendMessageToAllPorts = (message: any) => {
  ports.forEach((port) => {
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
    isRunning: true,
    isPaused: false
  };

  timerInterval = setInterval(() => {
    if (timerState.timeLeft > 0) {
      timerState = {
        ...timerState,
        timeLeft: timerState.timeLeft - 1
      };
    } else {
      // Timer completed
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }

      // Play sound and show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: timerState.currentPhase === 'focus' ? 'Focus Session Complete!' : 'Break Complete!',
        message: timerState.currentPhase === 'focus' ? 'Time for a break!' : 'Ready to focus?'
      });

      // Toggle phase
      timerState = {
        ...timerState,
        isRunning: false,
        currentPhase: timerState.currentPhase === 'focus' ? 'break' : 'focus',
        timeLeft: timerState.currentPhase === 'focus' ? BREAK_TIME : FOCUS_TIME
      };
    }

    sendMessageToAllPorts({
      type: 'TIMER_UPDATE',
      state: timerState
    });
  }, 1000);

  sendMessageToAllPorts({
    type: 'TIMER_UPDATE',
    state: timerState
  });
};

const pauseTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  timerState = {
    ...timerState,
    isRunning: false,
    isPaused: true
  };

  sendMessageToAllPorts({
    type: 'TIMER_UPDATE',
    state: timerState
  });
};

const resumeTimer = () => {
  startTimer();
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  timerState = {
    timeLeft: FOCUS_TIME,
    isRunning: false,
    isPaused: false,
    currentPhase: 'focus'
  };

  sendMessageToAllPorts({
    type: 'TIMER_UPDATE',
    state: timerState
  });
};

// Window management
const createWindow = async (options: { url: string; width?: number; height?: number }) => {
  const { url, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = options;
  
  return chrome.windows.create({
    url,
    width,
    height,
    type: 'popup',
    focused: true
  });
};

// Check if window exists
const windowExists = async (url: string): Promise<boolean> => {
  const windows = await chrome.windows.getAll({ populate: true });
  return windows.some((window) => {
    return window.tabs?.some((tab) => tab.url === url);
  });
};

// Handle messages from popup
chrome.runtime.onMessage.addListener((message: { type: string }, _sender, sendResponse) => {
  switch (message.type) {
    case 'START_TIMER':
      startTimer();
      sendResponse({ success: true });
      break;
    case 'PAUSE_TIMER':
      pauseTimer();
      sendResponse({ success: true });
      break;
    case 'RESUME_TIMER':
      resumeTimer();
      sendResponse({ success: true });
      break;
    case 'STOP_TIMER':
      stopTimer();
      sendResponse({ success: true });
      break;
    case 'GET_TIMER_STATE':
      sendResponse(timerState);
      break;
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  return true;
});

// Handle extension icon click
chrome.action.onClicked.addListener(async () => {
  try {
    const exists = await windowExists(POPUP_URL);
    if (!exists) {
      await createWindow({ url: POPUP_URL });
    }
  } catch (error) {
    console.error('Error handling icon click:', error);
  }
});
