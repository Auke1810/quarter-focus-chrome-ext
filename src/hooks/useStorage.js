import { useState, useEffect } from 'react';
import {
  loadSavedData,
  saveCompletedTasks,
  saveDailyStrategy,
  getArchivedTasks
} from '../services/chromeStorage';

export const useStorage = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [dailyStrategy, setDailyStrategy] = useState({
    keyTask: '',
    secondaryTask: '',
    dailyIntention: ''
  });
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [lastUpdateDate, setLastUpdateDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const savedData = await loadSavedData();
        const archived = await getArchivedTasks();

        setCompletedTasks(savedData.completedTasks);
        setDailyStrategy(savedData.dailyStrategy);
        setLastUpdateDate(savedData.lastUpdateDate);
        setArchivedTasks(archived);
      } catch (error) {
        console.error('Error loading saved data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Update completed tasks
  const updateCompletedTasks = async (newTasks) => {
    try {
      const result = await saveCompletedTasks(newTasks, lastUpdateDate);
      setCompletedTasks(result.completedTasks);
      
      if (result.archivedTasks) {
        setArchivedTasks(result.archivedTasks);
      }
      if (result.lastUpdateDate) {
        setLastUpdateDate(result.lastUpdateDate);
      }
    } catch (error) {
      console.error('Error updating completed tasks:', error);
    }
  };

  // Update daily strategy
  const updateDailyStrategy = async (strategy) => {
    try {
      await saveDailyStrategy(strategy);
      setDailyStrategy(strategy);
    } catch (error) {
      console.error('Error updating daily strategy:', error);
    }
  };

  return {
    completedTasks,
    setCompletedTasks: updateCompletedTasks,
    dailyStrategy,
    setDailyStrategy: updateDailyStrategy,
    archivedTasks,
    isLoading
  };
};
