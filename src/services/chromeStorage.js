import { STORAGE_KEYS, DEFAULTS } from '../constants';

/**
 * Chrome Storage Service
 * Handles all interactions with Chrome's storage API
 */

/**
 * Get data from Chrome's local storage
 * @param {string[]} keys - Array of keys to retrieve
 * @returns {Promise<Object>} Object containing the requested data
 */
export const getFromStorage = (keys) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
};

/**
 * Set data in Chrome's local storage
 * @param {Object} data - Data to store
 * @returns {Promise<void>}
 */
export const setInStorage = (data) => {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, resolve);
  });
};

/**
 * Clear specific keys from storage
 * @param {string[]} keys - Keys to remove
 * @returns {Promise<void>}
 */
export const removeFromStorage = (keys) => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, resolve);
  });
};

/**
 * Clear all data from storage
 * @returns {Promise<void>}
 */
export const clearStorage = () => {
  return new Promise((resolve) => {
    chrome.storage.local.clear(resolve);
  });
};

/**
 * Get archived tasks from storage
 * @returns {Promise<Array>} Array of archived tasks
 */
export const getArchivedTasks = async () => {
  const result = await getFromStorage([STORAGE_KEYS.ARCHIVED_TASKS]);
  return result[STORAGE_KEYS.ARCHIVED_TASKS] || DEFAULTS.ARCHIVED_TASKS;
};

/**
 * Save completed tasks and handle day transition
 * @param {Array} completedTasks - Array of completed tasks
 * @param {string} lastUpdateDate - Last update date string
 * @returns {Promise<Object>} Object containing new state
 */
export const saveCompletedTasks = async (completedTasks, lastUpdateDate) => {
  const today = new Date().toDateString();
  
  if (lastUpdateDate !== today) {
    if (completedTasks && completedTasks.length > 0) {
      const archivedTasks = await getArchivedTasks();
      const newArchiveEntry = {
        date: lastUpdateDate || 'Previous Day',
        tasks: completedTasks
      };
      const updatedArchive = [newArchiveEntry, ...archivedTasks];
      
      await setInStorage({
        [STORAGE_KEYS.ARCHIVED_TASKS]: updatedArchive,
        [STORAGE_KEYS.COMPLETED_TASKS]: DEFAULTS.COMPLETED_TASKS,
        [STORAGE_KEYS.LAST_UPDATE_DATE]: today,
        [STORAGE_KEYS.COMPLETED_POMODOROS]: 0
      });

      return {
        completedTasks: DEFAULTS.COMPLETED_TASKS,
        archivedTasks: updatedArchive,
        lastUpdateDate: today
      };
    } else {
      await setInStorage({
        [STORAGE_KEYS.LAST_UPDATE_DATE]: today,
        [STORAGE_KEYS.COMPLETED_TASKS]: DEFAULTS.COMPLETED_TASKS,
        [STORAGE_KEYS.COMPLETED_POMODOROS]: 0
      });

      return {
        completedTasks: DEFAULTS.COMPLETED_TASKS,
        lastUpdateDate: today
      };
    }
  }

  await setInStorage({ [STORAGE_KEYS.COMPLETED_TASKS]: completedTasks });
  return { completedTasks };
};

/**
 * Save daily strategy
 * @param {Object} strategy - Strategy object
 * @returns {Promise<void>}
 */
export const saveDailyStrategy = async (strategy) => {
  await setInStorage({ 
    [STORAGE_KEYS.DAILY_STRATEGY]: {
      ...strategy,
      date: new Date().toLocaleDateString()
    }
  });
};

/**
 * Load all saved data
 * @returns {Promise<Object>} Object containing all saved data
 */
export const loadSavedData = async () => {
  const data = await getFromStorage([
    STORAGE_KEYS.COMPLETED_TASKS,
    STORAGE_KEYS.LAST_UPDATE_DATE,
    STORAGE_KEYS.DAILY_STRATEGY,
    STORAGE_KEYS.CURRENT_TASK
  ]);

  return {
    completedTasks: data[STORAGE_KEYS.COMPLETED_TASKS] || DEFAULTS.COMPLETED_TASKS,
    lastUpdateDate: data[STORAGE_KEYS.LAST_UPDATE_DATE],
    dailyStrategy: data[STORAGE_KEYS.DAILY_STRATEGY] || DEFAULTS.DAILY_STRATEGY,
    currentTask: data[STORAGE_KEYS.CURRENT_TASK] || ''
  };
};

/**
 * Update task timing data
 * @param {Object} timingData - Object containing timing information
 * @returns {Promise<void>}
 */
export const updateTaskTiming = async ({ startTime, totalTime, completedPomodoros }) => {
  await setInStorage({
    [STORAGE_KEYS.TASK_START_TIME]: startTime,
    [STORAGE_KEYS.TASK_TOTAL_TIME]: totalTime,
    [STORAGE_KEYS.COMPLETED_POMODOROS]: completedPomodoros || 0
  });
};
