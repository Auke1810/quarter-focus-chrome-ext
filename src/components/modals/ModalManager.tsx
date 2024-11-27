import React from 'react';
import TaskArchiveModal from '../TaskArchiveModal';
import StrategyModal from '../StrategyModal';

const ModalManager: React.FC = () => {
  return (
    <>
      <TaskArchiveModal />
      <StrategyModal />
    </>
  );
};

export default ModalManager;
