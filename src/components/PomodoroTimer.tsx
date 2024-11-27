import React, { useEffect } from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import DailyIntention from './strategy/DailyIntention';
import TimerContainer from './timer/TimerContainer';
import TaskManager from './tasks/TaskManager';
import ModalManager from './modals/ModalManager';
import usePomodoroStore from '../store/pomodoroStore';

/**
 * PomodoroTimer Component
 * 
 * Root component of the Quarter Focus application.
 * Manages the overall layout and initialization of the application.
 * 
 * Component Structure:
 * - Header with app title and icon
 * - Daily intention display (when set)
 * - Timer interface with controls
 * - Task management section
 * - Footer with navigation links
 * - Modal system for strategy and history
 * 
 * Features:
 * - Automatic store initialization on mount
 * - Loading state management
 * - Responsive layout with proper spacing
 * - Semantic HTML structure
 * 
 * Accessibility:
 * - Proper ARIA roles and labels
 * - Loading state announcements
 * - Semantic HTML structure
 * - Keyboard navigation support
 * 
 * @component
 * @example
 * return (
 *   <PomodoroTimer />
 * )
 */
const PomodoroTimer: React.FC = () => {
  const { 
    isLoading,
    isInitialized,
    initialize
  } = usePomodoroStore();

  // Initialize store on mount
  useEffect(() => {
    const initStore = async () => {
      if (!isInitialized) {
        await initialize();
      }
    };
    initStore();
  }, [isInitialized, initialize]);

  if (!isInitialized || isLoading) {
    return (
      <div 
        className="h-full flex items-center justify-center"
        role="status"
        aria-label="Loading application"
      >
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex flex-col bg-gray-50"
      role="application"
      aria-label="Pomodoro Timer Application"
    >
      <div>
        <Header />
        <DailyIntention />
      </div>
      
      <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        <TimerContainer />
        <TaskManager />
      </main>

      <Footer />
      <ModalManager />
    </div>
  );
};

export default PomodoroTimer;
