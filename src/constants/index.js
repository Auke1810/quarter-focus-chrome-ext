/**
 * Timer Constants
 */
export const TIMER = {
  // Duration in minutes
  POMODORO: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
  
  // Duration in milliseconds
  TICK_INTERVAL: 1000,
  SAVE_INTERVAL: 5000,
  
  // Number of pomodoros before long break
  POMODOROS_BEFORE_LONG_BREAK: 4
};

/**
 * Window Constants
 */
export const WINDOW = {
  DEFAULT_WIDTH: 400,
  DEFAULT_HEIGHT: 600,
  MIN_WIDTH: 350,
  MIN_HEIGHT: 500
};

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  COMPLETED_TASKS: 'completedTasks',
  ARCHIVED_TASKS: 'archivedTasks',
  DAILY_STRATEGY: 'dailyStrategy',
  CURRENT_TASK: 'currentTask',
  LAST_UPDATE_DATE: 'lastUpdateDate',
  TASK_START_TIME: 'taskStartTime',
  TASK_TOTAL_TIME: 'taskTotalTime',
  COMPLETED_POMODOROS: 'completedPomodoros'
};

/**
 * Message Types
 */
export const MESSAGE_TYPES = {
  CLEAR_STORAGE: 'CLEAR_STORAGE',
  TIMER_COMPLETE: 'TIMER_COMPLETE',
  TIMER_START: 'TIMER_START',
  TIMER_PAUSE: 'TIMER_PAUSE',
  TIMER_RESUME: 'TIMER_RESUME',
  TIMER_STOP: 'TIMER_STOP'
};

/**
 * Timer States
 */
export const TIMER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed'
};

/**
 * Notification Messages
 */
export const NOTIFICATIONS = {
  BREAK_TIME: 'Time to take a break!',
  BREAK_OVER: 'Break time is over. Ready to focus?',
  SESSION_COMPLETE: 'Great job completing your session!',
  LONG_BREAK: 'Time for a longer break. You\'ve earned it!',
  DEFAULT_TITLE: 'Quarter Focus'
};

/**
 * Asset URLs
 */
export const ASSETS = {
  NOTIFICATION_SOUND: 'notification.mp3',
  COMPLETION_SOUND: 'completion.mp3',
  ICON: 'icon-128.png'
};

/**
 * Local Storage Default Values
 */
export const DEFAULTS = {
  DAILY_STRATEGY: {
    keyTask: '',
    secondaryTask: '',
    dailyIntention: ''
  },
  COMPLETED_TASKS: [],
  ARCHIVED_TASKS: []
};

/**
 * Chrome Extension URLs
 */
export const URLS = {
  POPUP: 'index.html'
};

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'MM/DD/YYYY',
  STORAGE: 'YYYY-MM-DD'
};
