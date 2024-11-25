import React from 'react';

const Footer = ({ onStrategyClick, onHistoryClick }) => {
  return (
    <footer style={{backgroundColor: '#15243D'}} className="p-2 sm:p-3 flex-shrink-0">
      <nav className="flex justify-between items-center">
        <a 
          href="https://www.quarterfocus.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-white hover:text-gray-300 text-sm sm:text-base"
        >
          Quarter Focus
        </a>
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={onStrategyClick}
            className="text-white hover:text-gray-300 text-sm sm:text-base whitespace-nowrap"
          >
            Strategy
          </button>
          <button
            onClick={onHistoryClick}
            className="text-white hover:text-gray-300 text-sm sm:text-base whitespace-nowrap"
          >
            History
          </button>
        </div>
      </nav>
    </footer>
  );
};

export default Footer;
