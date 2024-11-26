import React from 'react';

const Header = () => {
  return (
    <header style={{backgroundColor: '#15243D'}} className="p-2 sm:p-3 flex-shrink-0">
      <div className="flex items-center gap-2">
        <img src="icons/icon48.png" alt="Quarter Focus" className="w-6 h-6 sm:w-7 sm:h-7" />
        <h1 className="text-white text-base sm:text-lg">Quarter Focus: Only today</h1>
      </div>
    </header>
  );
};

export default Header;
