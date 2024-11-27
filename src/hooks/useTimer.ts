import { useEffect, useRef, useCallback } from 'react';
import usePomodoroStore from '../store/pomodoroStore';

/** Constants for timer durations */
const FOCUS_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

/**
 * Custom hook for managing the Pomodoro timer functionality
 * Handles timer state, phase transitions, and task completion
 * @returns {Object} Timer control methods and state
 */
export const useTimer = () => {
  const {
    isRunning,
    isPaused,
    timeLeft,
    currentPhase,
    selectedTask,
    setTimeLeft,
    setCurrentPhase,
    setIsRunning,
    setIsPaused,
    completeTask,
    setSelectedTask
  } = usePomodoroStore();

  /** Reference to the timer interval */
  const timerRef = useRef<number>();

  /**
   * Handles task completion and cleanup
   */
  const handleTaskCompletion = useCallback(() => {
    if (selectedTask) {
      const elapsedMinutes = Math.ceil((FOCUS_TIME - timeLeft) / 60);
      const isFullPomodoro = timeLeft === 0; // Only count if timer reached 0
      completeTask(selectedTask, elapsedMinutes, isFullPomodoro);
      setSelectedTask(null);
    }
  }, [selectedTask, timeLeft, completeTask, setSelectedTask]);

  /**
   * Starts a new Pomodoro session
   * Requires a selected task to begin
   */
  const handleStart = useCallback(() => {
    if (!selectedTask) return;
    setIsRunning(true);
    setIsPaused(false);
    setTimeLeft(FOCUS_TIME);
    setCurrentPhase('focus');
  }, [selectedTask, setIsRunning, setIsPaused, setTimeLeft, setCurrentPhase]);

  /**
   * Pauses the current timer
   * Maintains the current time and phase
   */
  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, [setIsPaused]);

  /**
   * Resumes the timer from a paused state
   */
  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, [setIsPaused]);

  /**
   * Stops the timer completely
   * Resets all timer state and clears the selected task
   */
  const handleStop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (currentPhase === 'focus' && selectedTask) {
      handleTaskCompletion();
    }
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(FOCUS_TIME);
    setCurrentPhase('focus');
  }, [setIsRunning, setIsPaused, setTimeLeft, setCurrentPhase, currentPhase, selectedTask, handleTaskCompletion]);

  /**
   * Formats time in seconds to MM:SS display format
   * @param {number} timeInSeconds - Time to format in seconds
   * @returns {string} Formatted time string (MM:SS)
   */
  const formatTime = useCallback((timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime: number) => {
          if (prevTime <= 1) {
            // Timer completed
            clearInterval(timerRef.current);
            
            if (currentPhase === 'focus') {
              // Complete the task if it was a focus session
              handleTaskCompletion();
              
              // Switch to break
              setCurrentPhase('break');
              setTimeLeft(BREAK_TIME);
            } else {
              // Break completed, reset timer
              setIsRunning(false);
              setCurrentPhase('focus');
              setTimeLeft(FOCUS_TIME);
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isRunning, isPaused, currentPhase, handleTaskCompletion, setTimeLeft, setCurrentPhase, setIsRunning]);

  return {
    isRunning,
    isPaused,
    timeLeft,
    currentPhase,
    selectedTask,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    formatTime,
    handleTaskCompletion
  };
};

export default useTimer;
