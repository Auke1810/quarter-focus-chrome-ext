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
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(FOCUS_TIME);
    setCurrentPhase('focus');
    setSelectedTask(null);
  }, [setIsRunning, setIsPaused, setTimeLeft, setCurrentPhase, setSelectedTask]);

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
              if (selectedTask) {
                completeTask(selectedTask);
              }
              
              // Switch to break
              setCurrentPhase('break');
              setTimeLeft(BREAK_TIME);
            } else {
              // Switch back to focus
              setCurrentPhase('focus');
              setTimeLeft(FOCUS_TIME);
              setIsRunning(false);
            }
            
            // Play sound and show notification
            const audio = new Audio(chrome.runtime.getURL('notification.mp3'));
            audio.play().catch(console.error);
            
            chrome.notifications.create({
              type: 'basic',
              iconUrl: chrome.runtime.getURL('icon48.png'),
              title: currentPhase === 'focus' ? 'Break Time!' : 'Focus Time!',
              message: currentPhase === 'focus' 
                ? 'Great work! Take a short break.'
                : 'Break is over. Ready to focus?'
            });

            return currentPhase === 'focus' ? BREAK_TIME : FOCUS_TIME;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused, currentPhase, selectedTask, completeTask, setCurrentPhase, setTimeLeft, setIsRunning]);

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
    formatTime
  };
};

export default useTimer;
