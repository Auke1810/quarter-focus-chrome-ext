import React from 'react';
import usePomodoroStore from '../../store/pomodoroStore';

const Footer: React.FC = () => {
  const { setActiveModal } = usePomodoroStore();

  return (
    <footer className="app-footer">
      <div className="flex justify-end items-center gap-2">
        <button
          onClick={() => setActiveModal('strategy')}
          className="footer-link"
        >
          Strategy
        </button>
        <span className="footer-separator">|</span>
        <button
          onClick={() => setActiveModal('archive')}
          className="footer-link"
        >
          History
        </button>
      </div>
    </footer>
  );
};

export default Footer;
