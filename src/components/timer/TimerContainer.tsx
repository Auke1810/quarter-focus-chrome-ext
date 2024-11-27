import React from 'react';
import Timer from './Timer';
import { useTimer } from '../../hooks/useTimer';

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
    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
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
