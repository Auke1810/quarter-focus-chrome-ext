// Constants for timer durations
const WORK_TIME = 25 * 60;  // 5 minutes
const BREAK_TIME = 5 * 60; // 2 minutes

let activePopup = null;
let timerState = {
  timeLeft: WORK_TIME,
  isActive: false,
  isPaused: false,
  currentTask: '',
  isBreak: false
};

let timerInterval = null;

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
  try {
    chrome.runtime.sendMessage({
      type: 'STATE_UPDATE',
      state: timerState
    }).catch(() => {});
  } catch {
    // Ignore errors when popup is closed
  }
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

function handleTimerComplete() {
  try {
    if (activePopup) {
      chrome.windows.update(activePopup.id, { focused: true })
        .catch(() => { activePopup = null; });
    }

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Quarter Focus',
      message: timerState.isBreak ? 'Break time is over. Ready to focus!' : 'Time for a break!'
    });

    timerState.isBreak = !timerState.isBreak;
    timerState.timeLeft = timerState.isBreak ? BREAK_TIME : WORK_TIME;
    timerState.isActive = true;
    timerState.isPaused = false;

    if (!timerInterval) {
      timerInterval = setInterval(handleTick, 1000);
    }

    updateBadgeText();
    broadcastState();

  } catch (error) {
    console.error('Timer completion failed:', error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

chrome.action.onClicked.addListener(async () => {
  if (activePopup) {
    try {
      await chrome.windows.update(activePopup.id, { focused: true });
      return;
    } catch (e) {
      activePopup = null;
    }
  }

  const popup = await chrome.windows.create({
    url: 'index.html',
    type: 'popup',
    width: 400,
    height: 600,
    focused: true
  });

  activePopup = popup;

  chrome.windows.onRemoved.addListener(function handleClose(windowId) {
    if (windowId === activePopup?.id) {
      activePopup = null;
      chrome.windows.onRemoved.removeListener(handleClose);
    }
  });
});

chrome.runtime.onStartup.addListener(() => {
  activePopup = null;
});