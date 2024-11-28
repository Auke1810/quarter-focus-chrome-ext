import React from 'react';
import Timer from './Timer';
import { useTimer } from '../../hooks/useTimer';

/**
 * TimerContainer Component
 * 
 * Container component that manages the timer state and controls.
 * Acts as a bridge between the useTimer hook and the Timer UI component.
 * 
 * Features:
 * - Manages timer state (running, paused, time left)
 * - Handles timer controls (start, pause, resume, stop)
 * - Provides time formatting
 * - Centers timer in the available space
 * 
 * Props passed to Timer:
 * - isRunning: Current running state
 * - isPaused: Current pause state
 * - timeLeft: Remaining time in seconds
 * - currentPhase: Current timer phase (focus/break)
 * - selectedTask: Currently selected task
 * - Timer control handlers (onStart, onPause, onResume, onStop)
 * - formatTime: Time formatting function
 * 
 * @component
 * @example
 * return (
 *   <TimerContainer />
 * )
 */

const TimerContainer: React.FC = () => {
  const {
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
  } = useTimer();

  return (
    <div className="timer-container">
      <Timer
        isRunning={isRunning}
        isPaused={isPaused}
        timeLeft={timeLeft}
        currentPhase={currentPhase}
        selectedTask={selectedTask}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        formatTime={formatTime}
      />
    </div>
  );
};

export default TimerContainer;
