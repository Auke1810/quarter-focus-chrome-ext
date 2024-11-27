import React from 'react';
import TaskArchiveModal from '../TaskArchiveModal';
import StrategyModal from '../StrategyModal';

/**
 * ModalManager Component
 * 
 * Manages the display of application modals based on the current active modal state.
 * Controls the rendering of Strategy and Task Archive modals.
 * 
 * Features:
 * - Conditional rendering of modals
 * - Centralized modal state management
 * - Integration with Zustand store
 * 
 * Modals:
 * - Strategy Modal: Daily strategy and intention setting
 * - Task Archive Modal: Historical task view
 * 
 * @component
 * @example
 * return (
 *   <ModalManager />
 * )
 */
const ModalManager: React.FC = () => {
  return (
    <>
      <TaskArchiveModal />
      <StrategyModal />
    </>
  );
};

export default ModalManager;
