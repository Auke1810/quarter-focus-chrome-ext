import React from 'react';
import { Play, Pause, Square } from 'lucide-react';

const Timer = ({ 
  timerState, 
  currentTask, 
  onStart, 
  onPause, 
  onResume, 
  onStop,
  formatTime 
}) => {
  return (
    <div className="text-center mb-4 sm:mb-6">
      <div className="text-[2.5em] font-bold text-gray-800 mb-1 sm:mb-2">
        {formatTime(timerState.timeLeft)}
      </div>
      <div className={`text-sm font-medium ${timerState.isBreak ? 'text-green-600' : 'text-blue-600'}`}>
        {timerState.isBreak ? 'Break Time' : 'Focus Time'}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {!timerState.isActive && !timerState.isPaused ? (
          <button
            onClick={onStart}
            disabled={!currentTask}
            className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md flex items-center text-sm sm:text-base ${
              currentTask
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="whitespace-nowrap">Start Timer</span>
          </button>
        ) : (
          <>
            {timerState.isPaused ? (
              <button
                onClick={onResume}
                className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm sm:text-base"
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="whitespace-nowrap">Resume</span>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center text-sm sm:text-base"
              >
                <Pause className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="whitespace-nowrap">Pause</span>
              </button>
            )}
            <button
              onClick={onStop}
              className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center text-sm sm:text-base"
            >
              <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="whitespace-nowrap">Stop</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;
