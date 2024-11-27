import React from 'react';
import usePomodoroStore from '../../store/pomodoroStore';

const Header: React.FC = () => {
  const { currentPhase } = usePomodoroStore();

  return (
    <header className="app-header">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 flex-shrink-0">
          <img 
            src="/icons/icon16.png" 
            alt="Quarter Focus"
            className="w-full h-full"
          />
        </div>
        <div className="flex items-baseline gap-1">
          <h1 
            className="header-title"
            role="banner"
          >
            Quarter Focus:
          </h1>
          <span className="header-subtitle">
            only today
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
