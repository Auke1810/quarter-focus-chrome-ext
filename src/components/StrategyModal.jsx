import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const StrategyModal = ({ isOpen, onClose }) => {
  const [keyTask, setKeyTask] = useState('');
  const [secondaryTask, setSecondaryTask] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load existing tasks when modal opens
      chrome.storage.local.get(['dailyStrategy'], (result) => {
        if (result.dailyStrategy) {
          setKeyTask(result.dailyStrategy.keyTask || '');
          setSecondaryTask(result.dailyStrategy.secondaryTask || '');
        }
      });
    }
  }, [isOpen]);

  const handleSave = () => {
    const strategy = {
      keyTask,
      secondaryTask,
      date: new Date().toLocaleDateString()
    };

    chrome.storage.local.set({ dailyStrategy: strategy }, () => {
      onClose();
    });
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
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Focus Task
            </label>
            <input
              type="text"
              value={keyTask}
              onChange={(e) => setKeyTask(e.target.value)}
              placeholder="What's your main focus for today?"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Focus Task
            </label>
            <input
              type="text"
              value={secondaryTask}
              onChange={(e) => setSecondaryTask(e.target.value)}
              placeholder="What's your secondary focus?"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
