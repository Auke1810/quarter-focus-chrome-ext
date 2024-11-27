/**
 * Timer related types
 */
export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerConfig {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  pomodorosBeforeLongBreak: number;
}

/**
 * Task related types
 */
export interface Task {
  id: string;
  text: string;
  duration: string;
  completedAt?: string;
}

export interface PomodoroTask {
  id: string;
  text: string;
  type: 'key' | 'secondary' | 'other';
  duration: string;
  completedAt?: string;
  completedPomodoros?: number;
}

export interface ArchivedTaskDay {
  date: string;
  tasks: PomodoroTask[];
  strategy: PomodoroDailyStrategy | null;
}

/**
 * Strategy related types
 */
export interface DailyStrategy {
  keyTask: string;
  secondaryTask: string;
  dailyIntention: string;
  date?: string;
}

export interface PomodoroDailyStrategy {
  keyTask: string;
  keyTaskPomodoros: number;
  secondaryTask: string;
  secondaryTaskPomodoros: number;
  dailyIntention: string;
  date: string;
}

/**
 * Storage related types
 */
export interface StorageData {
  completedTasks: Task[];
  lastUpdateDate?: string;
  dailyStrategy: DailyStrategy;
  currentTask: string;
  taskStartTime?: number;
  taskTotalTime?: number;
  completedPomodoros: number;
}

/**
 * Notification related types
 */
export interface NotificationOptions {
  title?: string;
  message: string;
  priority?: number;
}

/**
 * Window related types
 */
export interface WindowOptions {
  url: string;
  type?: chrome.windows.WindowType;
  width?: number;
  height?: number;
}

/**
 * Message related types
 */
export type MessageType = 
  | 'CLEAR_STORAGE'
  | 'TIMER_COMPLETE'
  | 'TIMER_START'
  | 'TIMER_PAUSE'
  | 'TIMER_RESUME'
  | 'TIMER_STOP';

export interface ChromeMessage {
  type: MessageType;
  payload?: any;
}

/**
 * Hook return types
 */
export interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

export interface UseSoundReturn {
  playNotificationSound: (message?: string) => Promise<void>;
  playCompletionSound: (message?: string) => Promise<void>;
  hasPermission: boolean;
}

export interface UseStorageReturn {
  completedTasks: Task[];
  setCompletedTasks: (tasks: Task[]) => Promise<void>;
  dailyStrategy: DailyStrategy;
  setDailyStrategy: (strategy: DailyStrategy) => Promise<void>;
  archivedTasks: ArchivedTaskDay[];
  isLoading: boolean;
}

// Timer types
export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  currentPhase: 'focus' | 'break';
}

export type PomodoroTimerState = {
  timeLeft: number;
  isActive: boolean;
  isPaused: boolean;
  isBreak: boolean;
};

export type TimerProps = {
  timerState: PomodoroTimerState;
  currentTask: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  formatTime: (seconds: number) => string;
};

// Task types
export type PomodoroTaskType = 'key' | 'secondary' | 'rest';

// Strategy types

// Component prop types
export type TimerContainerProps = {
  currentTask: string;
  dailyStrategy: PomodoroDailyStrategy;
  completedTasks: PomodoroTask[];
  setCompletedTasks: (tasks: PomodoroTask[]) => void;
  setCurrentTask: (task: string) => void;
};

export type TaskManagerProps = {
  currentTask: string;
  setCurrentTask: (task: string) => void;
  completedTasks: PomodoroTask[];
  dailyStrategy: PomodoroDailyStrategy;
  showTaskDropdown: boolean;
  setShowTaskDropdown: (show: boolean) => void;
};

export type FooterProps = {
  onStrategyClick: () => void;
  onHistoryClick: () => void;
};

export type ModalManagerProps = {
  isArchiveModalOpen: boolean;
  setIsArchiveModalOpen: (open: boolean) => void;
  isStrategyModalOpen: boolean;
  setIsStrategyModalOpen: (open: boolean) => void;
  archivedTasks: PomodoroTask[];
  onStrategyModalSave: (strategy: PomodoroDailyStrategy) => void;
};

export interface CompletedTasksProps {
  completedTasks: PomodoroTask[];
  calculateTotalTime: (tasks: PomodoroTask[]) => string;
}

export interface DailyIntentionProps {
  intention?: string;
}

export interface TaskArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  archivedTasks: ArchivedTaskDay[];
}

export interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (strategy: PomodoroDailyStrategy) => void;
}

// Storage hook types
export type StorageState = {
  completedTasks: PomodoroTask[];
  setCompletedTasks: (tasks: PomodoroTask[]) => void;
  dailyStrategy: PomodoroDailyStrategy;
  setDailyStrategy: (strategy: PomodoroDailyStrategy) => void;
  archivedTasks: PomodoroTask[];
  isLoading: boolean;
}

// Store types
export type ModalType = 'strategy' | 'archive' | null;

export interface PomodoroStore {
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  currentPhase: 'focus' | 'break';
  tasks: PomodoroTask[];
  completedTasks: PomodoroTask[];
  selectedTask: string | null;
  showTaskDropdown: boolean;
  archivedTasks: ArchivedTaskDay[];
  dailyStrategy: PomodoroDailyStrategy | null;
  activeModal: 'strategy' | 'archive' | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  setIsRunning: (isRunning: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  setTimeLeft: (timeLeft: number | ((prev: number) => number)) => void;
  setCurrentPhase: (currentPhase: 'focus' | 'break') => void;
  resetTimer: () => void;
  addTask: (task: PomodoroTask) => void;
  removeTask: (taskId: string) => void;
  completeTask: (taskText: string, elapsedMinutes: number, isFullPomodoro: boolean) => void;
  setSelectedTask: (taskId: string | null) => void;
  setTasks: (tasks: PomodoroTask[]) => void;
  setCompletedTasks: (tasks: PomodoroTask[]) => void;
  setArchivedTasks: (tasks: ArchivedTaskDay[]) => void;
  setShowTaskDropdown: (show: boolean) => void;
  selectPredefinedTask: (taskType: 'key' | 'secondary') => void;
  setDailyStrategy: (strategy: PomodoroDailyStrategy | null) => void;
  setActiveModal: (modal: 'strategy' | 'archive' | null) => void;
  closeModal: () => void;
  persistToStorage: () => Promise<void>;
}
