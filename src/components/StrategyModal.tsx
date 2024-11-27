import React, { useState, useEffect, ChangeEvent } from 'react';
import { X } from 'lucide-react';
import { PomodoroDailyStrategy } from '../types';
import usePomodoroStore from '../store/pomodoroStore';

const StrategyModal: React.FC = () => {
  const { 
    activeModal,
    setActiveModal,
    dailyStrategy,
    setDailyStrategy 
  } = usePomodoroStore();

  const [keyTask, setKeyTask] = useState('');
  const [keyTaskPomodoros, setKeyTaskPomodoros] = useState<number>(1);
  const [secondaryTask, setSecondaryTask] = useState('');
  const [secondaryTaskPomodoros, setSecondaryTaskPomodoros] = useState<number>(1);
  const [dailyIntention, setDailyIntention] = useState('');

  const isOpen = activeModal === 'strategy';
  const onClose = () => setActiveModal(null);

  useEffect(() => {
    if (isOpen && dailyStrategy) {
      setKeyTask(dailyStrategy.keyTask || '');
      setKeyTaskPomodoros(dailyStrategy.keyTaskPomodoros || 1);
      setSecondaryTask(dailyStrategy.secondaryTask || '');
      setSecondaryTaskPomodoros(dailyStrategy.secondaryTaskPomodoros || 1);
      setDailyIntention(dailyStrategy.dailyIntention || '');
    }
  }, [isOpen, dailyStrategy]);

  const handleSave = () => {
    const strategy: PomodoroDailyStrategy = {
      keyTask,
      keyTaskPomodoros: parseInt(keyTaskPomodoros.toString()) || 1,
      secondaryTask,
      secondaryTaskPomodoros: parseInt(secondaryTaskPomodoros.toString()) || 1,
      dailyIntention,
      date: new Date().toLocaleDateString()
    };

    setDailyStrategy(strategy);
    onClose();
  };

  const handlePomodoroChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 12) {
      setter(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Daily Strategy</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="dailyIntention">
              Daily Intention
            </label>
            <input
              id="dailyIntention"
              type="text"
              value={dailyIntention}
              onChange={(e) => setDailyIntention(e.target.value)}
              placeholder="What's your intention for today?"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">Set your mindset or intention for the day</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="keyTask">
              Key Focus Task
            </label>
            <div className="flex gap-2">
              <input
                id="keyTask"
                type="text"
                value={keyTask}
                onChange={(e) => setKeyTask(e.target.value)}
                placeholder="What's your main focus for today?"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-shrink-0 w-32">
                <label className="block text-xs text-gray-500 mb-1" htmlFor="keyTaskPomodoros">
                  Pomodoros
                </label>
                <input
                  id="keyTaskPomodoros"
                  type="number"
                  min="1"
                  max="12"
                  value={keyTaskPomodoros}
                  onChange={(e) => handlePomodoroChange(e, setKeyTaskPomodoros)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Planned duration: {keyTaskPomodoros * 25} minutes ({(keyTaskPomodoros * 25 / 60).toFixed(1)} hours)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="secondaryTask">
              Secondary Focus Task
            </label>
            <div className="flex gap-2">
              <input
                id="secondaryTask"
                type="text"
                value={secondaryTask}
                onChange={(e) => setSecondaryTask(e.target.value)}
                placeholder="What's your secondary focus?"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-shrink-0 w-32">
                <label className="block text-xs text-gray-500 mb-1" htmlFor="secondaryTaskPomodoros">
                  Pomodoros
                </label>
                <input
                  id="secondaryTaskPomodoros"
                  type="number"
                  min="1"
                  max="12"
                  value={secondaryTaskPomodoros}
                  onChange={(e) => handlePomodoroChange(e, setSecondaryTaskPomodoros)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Planned duration: {secondaryTaskPomodoros * 25} minutes ({(secondaryTaskPomodoros * 25 / 60).toFixed(1)} hours)
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Strategy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyModal;
