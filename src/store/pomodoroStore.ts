import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PomodoroStore, PomodoroTask, PomodoroDailyStrategy, ArchivedTaskDay } from '../types';

const INITIAL_STATE = {
  // Timer state
  isRunning: false,
  isPaused: false,
  timeLeft: 25 * 60,
  currentPhase: 'focus' as const,
  
  // Task state
  tasks: [] as PomodoroTask[],
  completedTasks: [] as PomodoroTask[],
  selectedTask: null as string | null,
  showTaskDropdown: false,
  archivedTasks: [] as ArchivedTaskDay[],
  
  // Strategy state
  dailyStrategy: null as PomodoroDailyStrategy | null,
  
  // Modal state
  activeModal: null as 'strategy' | 'archive' | null,
  
  // Loading state
  isLoading: true,
  isInitialized: false
};

// Create store with middleware
const usePomodoroStore = create<PomodoroStore>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,

      // Initialize store
      initialize: async () => {
        if (get().isInitialized) return;
        
        try {
          const result = await chrome.storage.local.get([
            'tasks',
            'completedTasks',
            'dailyStrategy',
            'selectedTask',
            'archivedTasks'
          ]);

          set({
            tasks: Array.isArray(result.tasks) ? result.tasks : [],
            completedTasks: Array.isArray(result.completedTasks) ? result.completedTasks : [],
            dailyStrategy: result.dailyStrategy || null,
            selectedTask: typeof result.selectedTask === 'string' ? result.selectedTask : null,
            archivedTasks: Array.isArray(result.archivedTasks) ? result.archivedTasks : [],
            isLoading: false,
            isInitialized: true
          });
        } catch (error) {
          console.error('Error initializing store:', error);
          set({ 
            ...INITIAL_STATE, 
            isLoading: false,
            isInitialized: true
          });
        }
      },

      // Timer actions
      setIsRunning: (isRunning: boolean) => set({ isRunning }),
      setIsPaused: (isPaused: boolean) => set({ isPaused }),
      setTimeLeft: (timeLeft: number | ((prev: number) => number)) => 
        set(state => ({ 
          timeLeft: typeof timeLeft === 'function' ? timeLeft(state.timeLeft) : timeLeft 
        })),
      setCurrentPhase: (currentPhase: 'focus' | 'break') => set({ currentPhase }),
      resetTimer: () => set({ 
        timeLeft: 25 * 60, 
        isRunning: false, 
        isPaused: false 
      }),

      // Task actions
      addTask: (task: PomodoroTask) => 
        set(state => ({ tasks: [...state.tasks, task] })),
      removeTask: (taskId: string) => 
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== taskId)
        })),
      completeTask: (taskText: string, elapsedMinutes: number, isFullPomodoro: boolean) => {
        const completedTask = {
          id: Date.now().toString(),
          text: taskText,
          duration: elapsedMinutes,
          completedAt: new Date().toISOString(),
          pomodoroCount: isFullPomodoro ? 1 : 0
        };
        
        set(state => ({
          completedTasks: [...state.completedTasks, completedTask],
          selectedTask: null
        }));
      },
      setSelectedTask: (taskText: string | null) => set({ selectedTask: taskText }),
      setTasks: (tasks: PomodoroTask[]) => set({ tasks }),
      setCompletedTasks: (tasks: PomodoroTask[]) => set({ completedTasks: tasks }),
      setArchivedTasks: (tasks: ArchivedTaskDay[]) => set({ archivedTasks: tasks }),
      setShowTaskDropdown: (show: boolean) => {
        set({ showTaskDropdown: show });
        
        if (show) {
          const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.task-dropdown-container')) {
              set({ showTaskDropdown: false });
              document.removeEventListener('mousedown', handleClickOutside);
            }
          };
          document.addEventListener('mousedown', handleClickOutside);
        }
      },
      selectPredefinedTask: (taskType: 'key' | 'secondary') => {
        const state = get();
        if (!state.dailyStrategy) return;

        const task = taskType === 'key' ? state.dailyStrategy.keyTask : state.dailyStrategy.secondaryTask;
        if (task) {
          set({ 
            selectedTask: task,
            showTaskDropdown: false 
          });
        }
      },

      // Strategy actions
      setDailyStrategy: (strategy: PomodoroDailyStrategy | null) => {
        set({ dailyStrategy: strategy });
        get().setActiveModal(null);
      },

      // Modal actions
      setActiveModal: (modal: 'strategy' | 'archive' | null) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),

      // Storage sync
      persistToStorage: async () => {
        try {
          const state = get();
          await chrome.storage.local.set({
            tasks: state.tasks,
            completedTasks: state.completedTasks,
            dailyStrategy: state.dailyStrategy,
            selectedTask: state.selectedTask,
            archivedTasks: state.archivedTasks
          });
        } catch (error) {
          console.error('Error persisting to storage:', error);
        }
      }
    }),
    {
      name: 'pomodoro-store',
      enabled: true
    }
  )
);

// Subscribe to changes and persist to storage
usePomodoroStore.subscribe((state, prevState) => {
  // Only persist if relevant state has changed and store is initialized
  if (
    state.isInitialized && !state.isLoading && (
      state.tasks !== prevState.tasks ||
      state.completedTasks !== prevState.completedTasks ||
      state.dailyStrategy !== prevState.dailyStrategy ||
      state.selectedTask !== prevState.selectedTask ||
      state.archivedTasks !== prevState.archivedTasks
    )
  ) {
    usePomodoroStore.getState().persistToStorage();
  }
});

export default usePomodoroStore;
