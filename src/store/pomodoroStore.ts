import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PomodoroStore, PomodoroTask, PomodoroDailyStrategy, ArchivedTaskDay } from '../types';
import { isToday } from '../utils/dateUtils';

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

      // Helper functions
      isToday: (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
      },

      // Initialize store
      initialize: async () => {
        if (get().isInitialized) return;
        
        try {
          const result = await chrome.storage.sync.get([
            'tasks',
            'completedTasks',
            'dailyStrategy',
            'selectedTask',
            'archivedTasks'
          ]);

          // Check if daily strategy is from a previous day
          let dailyStrategy = result.dailyStrategy || null;
          if (dailyStrategy && dailyStrategy.date && !isToday(dailyStrategy.date)) {
            dailyStrategy = null;
          }

          // Move non-today tasks to archived
          const completedTasks = Array.isArray(result.completedTasks) ? result.completedTasks : [];
          const archivedTasks = Array.isArray(result.archivedTasks) ? result.archivedTasks : [];
          
          const { todayTasks, otherTasks } = completedTasks.reduce(
            (acc: { todayTasks: PomodoroTask[]; otherTasks: PomodoroTask[] }, task: PomodoroTask) => {
              if (task.completedAt && isToday(new Date(task.completedAt).toISOString())) {
                acc.todayTasks.push(task);
              } else {
                acc.otherTasks.push(task);
              }
              return acc;
            },
            { todayTasks: [], otherTasks: [] }
          );

          // Group other tasks by date
          const tasksByDate = otherTasks.reduce((acc: { [key: string]: PomodoroTask[] }, task: PomodoroTask) => {
            if (task.completedAt) {
              const date = new Date(task.completedAt).toISOString().split('T')[0];
              if (!acc[date]) {
                acc[date] = [];
              }
              acc[date].push(task);
            }
            return acc;
          }, {});

          console.error('DEBUG: tasksByDate before conversion', {
            tasksByDate: JSON.stringify(tasksByDate),
            tasksByDateKeys: Object.keys(tasksByDate)
          });

          const newArchivedTasks = [
            ...archivedTasks,
            ...Object.entries(tasksByDate).map(([date, tasks]) => {
              // Add type guard to ensure tasks is an array of PomodoroTask
              const typedTasks = Array.isArray(tasks) 
                ? tasks 
                : tasks instanceof Object 
                  ? Object.values(tasks) as PomodoroTask[] 
                  : [];

              console.error(`DEBUG: Converting date ${date}`, {
                tasksType: typeof tasks,
                tasksIsArray: Array.isArray(tasks),
                tasksLength: typedTasks.length,
                firstTaskKeys: typedTasks.length > 0 ? Object.keys(typedTasks[0]) : 'No tasks'
              });

              return {
                date,
                tasks: typedTasks,  // Use the typed tasks
                strategy: null
              };
            })
          ];

          const sanitizedArchivedTasks = newArchivedTasks.map(dayData => {
            console.error('DEBUG: Sanitizing archived tasks', {
              date: dayData.date,
              tasksType: typeof dayData.tasks,
              tasksIsArray: Array.isArray(dayData.tasks),
              tasksLength: dayData.tasks.length,
              firstTaskKeys: dayData.tasks.length > 0 ? Object.keys(dayData.tasks[0]) : 'No tasks'
            });

            return {
              ...dayData,
              tasks: Array.isArray(dayData.tasks) ? dayData.tasks : []
            };
          });

          console.error('DEBUG: Final sanitized archived tasks', {
            sanitizedArchivedTasksLength: sanitizedArchivedTasks.length,
            firstArchivedTaskDate: sanitizedArchivedTasks[0]?.date,
            firstArchivedTaskTasksType: typeof sanitizedArchivedTasks[0]?.tasks,
            firstArchivedTaskTasksIsArray: Array.isArray(sanitizedArchivedTasks[0]?.tasks)
          });

          // Sort archived tasks by date (newest first)
          sanitizedArchivedTasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          set({
            tasks: Array.isArray(result.tasks) ? result.tasks : [],
            completedTasks: todayTasks,
            dailyStrategy: dailyStrategy,
            selectedTask: typeof result.selectedTask === 'string' ? result.selectedTask : null,
            archivedTasks: sanitizedArchivedTasks,
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
        const completedTask: PomodoroTask = {
          id: `${Date.now()}`,
          text: taskText,
          type: 'other',
          duration: elapsedMinutes.toString(),
          completedAt: new Date().toISOString(),
          pomodoroCount: isFullPomodoro ? 1 : 0
        };
        
        set((state) => {
          const newState = {
            ...state,
            completedTasks: [...state.completedTasks, completedTask]
          };
          return newState;
        });
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
        const strategyWithDate = strategy 
          ? { ...strategy, date: new Date().toISOString() } 
          : strategy;
        set({ dailyStrategy: strategyWithDate });
        get().setActiveModal(null);
      },

      // Modal actions
      setActiveModal: (modal: 'strategy' | 'archive' | null) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),

      // Storage sync
      persistToStorage: async () => {
        try {
          await chrome.storage.sync.set({
            tasks: get().tasks,
            completedTasks: get().completedTasks,
            dailyStrategy: get().dailyStrategy,
            selectedTask: get().selectedTask,
            archivedTasks: get().archivedTasks
          });
        } catch (error) {
          console.error('Error persisting to storage:', error);
        }
      },

      // New method to clear all storage
      clearAllStorage: async () => {
        try {
          await chrome.storage.sync.clear();
          console.error('ALL STORAGE CLEARED');
          
          // Reset store to initial state
          set({
            ...INITIAL_STATE,
            isLoading: false,
            isInitialized: true
          });
        } catch (error) {
          console.error('Error clearing storage:', error);
        }
      },
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
