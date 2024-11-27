// Constants for timer durations
const WORK_TIME = 25 * 60;  // 25 minutes
const BREAK_TIME = 5 * 60;  // 5 minutes

let activePopup = null;
let timerState = {
  timeLeft: WORK_TIME,
  isActive: false,
  isPaused: false,
  currentTask: '',
  isBreak: false
};

let timerInterval = null;
let isCreatingWindow = false;

// Helper function to find existing timer window
async function findExistingTimerWindow() {
  try {
    console.log('Searching for existing timer window...');
    const windows = await chrome.windows.getAll({ populate: true });
    console.log('Found windows:', windows.length);
    
    // First try to use activePopup if it exists
    if (activePopup) {
      try {
        const window = await chrome.windows.get(activePopup.id);
        if (window) {
          console.log('Found active popup window:', window.id);
          return window;
        }
      } catch (e) {
        console.log('Active popup window no longer exists');
        activePopup = null;
      }
    }

    // Search through all windows
    for (const window of windows) {
      const url = window.tabs?.[0]?.url;
      console.log('Checking window:', window.id, 'URL:', url);
      
      // Check if this is our extension window
      if (window.type === 'popup' && url) {
        const isExtensionUrl = url.includes('chrome-extension://') && url.endsWith('/index.html');
        const isDevUrl = url.includes('quarter-focus-chrome-ext') && url.endsWith('/index.html');
        
        if (isExtensionUrl || isDevUrl) {
          console.log('Found timer window:', window.id);
          activePopup = window; // Update activePopup reference
          return window;
        }
      }
    }
    
    console.log('No existing timer window found');
    return null;
  } catch (error) {
    console.error('Error finding existing timer window:', error);
    return null;
  }
}

// Helper function to focus existing window
async function focusExistingWindow(windowId) {
  try {
    console.log('Focusing window:', windowId);
    await chrome.windows.update(windowId, { 
      focused: true,
      drawAttention: true
    });
    return true;
  } catch (error) {
    console.error('Error focusing window:', error);
    activePopup = null; // Reset activePopup if focus fails
    return false;
  }
}

// Helper function to create timer window
async function createTimerWindow() {
  console.log('Creating timer window...');
  
  if (isCreatingWindow) {
    console.log('Window creation already in progress');
    return null;
  }

  try {
    isCreatingWindow = true;

    // Double-check for existing windows
    const existingWindow = await findExistingTimerWindow();
    if (existingWindow) {
      console.log('Found existing window, focusing:', existingWindow.id);
      await focusExistingWindow(existingWindow.id);
      return existingWindow;
    }

    // Get the screen dimensions
    const { width: screenWidth } = await chrome.windows.getLastFocused();
    
    const width = 400;
    const height = 600;
    const left = Math.round((screenWidth - width) / 2);

    console.log('Creating new window...');
    const popup = await chrome.windows.create({
      url: 'index.html',
      type: 'popup',
      width: width,
      height: height,
      left: left,
      top: 100,
      focused: true
    });

    // Verify the window was created successfully
    const createdWindow = await chrome.windows.get(popup.id);
    if (!createdWindow) {
      throw new Error('Window creation verification failed');
    }

    console.log('New window created:', popup.id);
    activePopup = popup;

    // Add listener for window close
    const handleClose = (windowId) => {
      if (windowId === activePopup?.id) {
        console.log('Timer window closed:', windowId);
        activePopup = null;
        chrome.windows.onRemoved.removeListener(handleClose);
      }
    };

    chrome.windows.onRemoved.addListener(handleClose);

    return popup;
  } catch (error) {
    console.error('Error creating timer window:', error);
    activePopup = null;
    return null;
  } finally {
    isCreatingWindow = false;
  }
}

function handleTick() {
  if (timerState.isActive && !timerState.isPaused && timerState.timeLeft > 0) {
    timerState.timeLeft--;
    updateBadgeText();
    broadcastState();
    
    if (timerState.timeLeft === 0) {
      handleTimerComplete();
    }
  }
}

function broadcastState() {
  chrome.runtime.sendMessage({
    type: 'STATE_UPDATE',
    state: timerState
  }).catch(() => {
    // Ignore errors when popup is closed
  });
}

function updateBadgeText() {
  const minutes = Math.floor(timerState.timeLeft / 60);
  const seconds = timerState.timeLeft % 60;
  chrome.action.setBadgeText({
    text: `${minutes}:${seconds.toString().padStart(2, '0')}`
  });
  chrome.action.setBadgeBackgroundColor({ 
    color: timerState.isBreak ? '#22C55E' : '#15243D'
  });
}

async function handleTimerComplete() {
  try {
    const existingWindow = await findExistingTimerWindow();
    if (existingWindow) {
      await focusExistingWindow(existingWindow.id);
    }

    // Create notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Quarter Focus',
      message: timerState.isBreak ? 'Break time is over. Ready to focus!' : 'Time for a break!',
      silent: true
    });

    // Send message to play sound
    chrome.runtime.sendMessage({ 
      type: 'PLAY_NOTIFICATION_SOUND'
    }).catch(() => {
      console.log('No active popup to play sound');
    });

    // Update timer state
    timerState.isBreak = !timerState.isBreak;
    timerState.timeLeft = timerState.isBreak ? BREAK_TIME : WORK_TIME;
    
    // Auto-start break, pause for focus time
    if (timerState.isBreak) {
      timerState.isActive = true;
      timerState.isPaused = false;
      if (!timerInterval) {
        timerInterval = setInterval(handleTick, 1000);
      }
    } else {
      timerState.isActive = false;
      timerState.isPaused = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    updateBadgeText();
    broadcastState();

  } catch (error) {
    console.error('Timer completion failed:', error);
  }
}

// Message handlers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLEAR_STORAGE') {
    chrome.storage.local.clear(() => {
      const today = new Date().toDateString();
      chrome.storage.local.set({
        lastUpdateDate: today,
        completedTasks: [],
        completedPomodoros: 0,
        archivedTasks: []
      }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  switch (message.type) {
    case 'START_TIMER':
      timerState.currentTask = message.payload.currentTask;
      timerState.isActive = true;
      timerState.isPaused = false;
      if (!timerInterval) {
        timerInterval = setInterval(handleTick, 1000);
      }
      updateBadgeText();
      broadcastState();
      break;
      
    case 'PAUSE_TIMER':
      timerState.isPaused = true;
      updateBadgeText();
      broadcastState();
      break;
      
    case 'RESUME_TIMER':
      timerState.isPaused = false;
      if (!timerInterval) {
        timerInterval = setInterval(handleTick, 1000);
      }
      updateBadgeText();
      broadcastState();
      break;
      
    case 'STOP_TIMER':
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      timerState.isActive = false;
      timerState.isPaused = false;
      timerState.timeLeft = WORK_TIME;
      timerState.currentTask = '';
      timerState.isBreak = false;
      chrome.action.setBadgeText({ text: '' });
      broadcastState();
      break;
      
    case 'GET_STATE':
      sendResponse(timerState);
      return true;
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async () => {
  await createTimerWindow();
});

// Reset state when extension starts
chrome.runtime.onStartup.addListener(() => {
  activePopup = null;
  isCreatingWindow = false;
});