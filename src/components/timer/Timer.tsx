import React from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';

/**
 * Timer Component
 * 
 * Displays the timer interface with controls and current status.
 * Provides visual feedback for different timer states and phases.
 * 
 * Features:
 * - Large time display in MM:SS format
 * - Phase indicator (Focus/Break)
 * - Context-aware control buttons
 * - Responsive design with mobile-friendly sizing
 * 
 * Visual States:
 * - Not Started: Shows Start button (disabled if no task selected)
 * - Running: Shows Pause and Stop buttons
 * - Paused: Shows Resume and Stop buttons
 * - Break/Focus phases with different color schemes
 * 
 * Accessibility:
 * - Proper button labels
 * - Color contrast compliance
 * - Icon + text for better comprehension
 * - Disabled state handling
 * 
 * @component
 * @example
 * return (
 *   <Timer />
 * )
 */
const Timer: React.FC = () => {
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
    <div className="text-center mb-4 sm:mb-6">
      <div className="text-[2.5em] font-bold text-white mb-1 sm:mb-2">
        {formatTime(timeLeft)}
      </div>
      <div className={`text-sm font-medium ${currentPhase === 'break' ? 'text-green-300' : 'text-blue-300'}`}>
        {currentPhase === 'break' ? 'Break Time' : 'Focus Time'}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {!isRunning && !isPaused ? (
          <button
            onClick={handleStart}
            disabled={!selectedTask}
            className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md flex items-center text-sm sm:text-base ${
              selectedTask
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Start timer"
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="whitespace-nowrap">Start Timer</span>
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={handleResume}
                className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm sm:text-base"
                aria-label="Resume timer"
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center text-sm sm:text-base"
                aria-label="Pause timer"
              >
                <Pause className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span>Pause</span>
              </button>
            )}
            <button
              onClick={handleStop}
              className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center text-sm sm:text-base"
              aria-label="Stop timer"
            >
              <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span>Stop</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;
