import { useEffect, useRef, useCallback } from 'react';
import usePomodoroStore from '../store/pomodoroStore';
import { useSound } from './useSound';

/** Constants for timer durations */
const FOCUS_TIME = 25*60; // 25 minute in seconds
const BREAK_TIME = 5*60; // 5 minutes in seconds

/**
 * Custom hook for managing the Pomodoro timer
 * Handles focus sessions, breaks, and task completion
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
    completeTask
  } = usePomodoroStore();

  const { playNotificationSound, playCompletionSound } = useSound();
  
  /** Reference to the timer interval */
  const timerRef = useRef<number>();

  /**
   * Initiates the break phase after focus completion
   * Keeps the timer running and maintains task visibility
   */
  const startBreakPhase = useCallback(() => {
    setCurrentPhase('break');
    setTimeLeft(BREAK_TIME);
    setIsRunning(true);
    setIsPaused(false);
  }, [setCurrentPhase, setTimeLeft, setIsRunning, setIsPaused]);

  /**
   * Handles task completion and initiates break phase
   * Records pomodoro completion while maintaining task
   */
  const handleTaskCompletion = useCallback(async () => {
    if (!selectedTask) return;

    // Record pomodoro completion
    const elapsedMinutes = Math.ceil((FOCUS_TIME - timeLeft) / 60);
    completeTask(selectedTask, elapsedMinutes, true);

    try {
      // Play completion sound and show notification
      await playCompletionSound('Focus session complete! Time for a break.');
    } catch (error) {
      console.error('Error playing completion sound:', error);
    }

    // Start break phase
    startBreakPhase();
  }, [selectedTask, timeLeft, completeTask, playCompletionSound, startBreakPhase]);

  /**
   * Resets timer state for a new focus session
   * Maintains current task while resetting timer values
   */
  const resetForNextSession = useCallback(() => {
    setCurrentPhase('focus');
    setTimeLeft(FOCUS_TIME);
    setIsRunning(false);
    setIsPaused(false);
  }, [setCurrentPhase, setTimeLeft, setIsRunning, setIsPaused]);

  /**
   * Handles break completion
   * Plays notification and prepares for next focus session
   */
  const handleBreakComplete = useCallback(async () => {
    try {
      // Play notification for break end
      await playNotificationSound('Break time is over. Ready to focus?');
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }

    // Reset for next focus session
    resetForNextSession();
  }, [playNotificationSound, resetForNextSession]);

  /**
   * Starts a new Pomodoro session
   * Requires a selected task to begin
   */
  const handleStart = useCallback(async () => {
    if (!selectedTask) return;
    
    // Request notification permissions on first start
    try {
      await playNotificationSound('Timer started! Focus time begins.');
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
    
    setIsRunning(true);
    setIsPaused(false);
    setTimeLeft(FOCUS_TIME);
    setCurrentPhase('focus');
  }, [selectedTask, setIsRunning, setIsPaused, setTimeLeft, setCurrentPhase, playNotificationSound]);

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
    resetForNextSession();
  }, [resetForNextSession]);

  /**
   * Formats time in seconds to MM:SS display format
   */
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Main timer effect
   * Handles countdown and phase transitions
   */
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime: number) => {
          const newTime = prevTime - 1;
          
          if (newTime <= 0) {
            // Clear interval first
            clearInterval(timerRef.current);
            
            // Then handle phase completion
            if (currentPhase === 'focus') {
              handleTaskCompletion();
            } else {
              handleBreakComplete();
            }
            return 0;
          }
          
          return newTime;
        });
      }, 1000);

      // Cleanup interval on unmount or when timer stops
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isRunning, isPaused, currentPhase, handleTaskCompletion, handleBreakComplete]);

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
