import React from 'react';
import usePomodoroStore from '../../store/pomodoroStore';

/**
 * Footer Component
 * 
 * Application footer containing navigation links to Strategy and History modals.
 * Features a distinctive styling with interactive elements.
 * 
 * Features:
 * - Strategy and History links aligned to the right
 * - Orange links (#e9530d) that turn white on hover
 * - Separated by a matching orange pipe character
 * - Dark blue background (#16233d)
 * - Consistent 0.5rem padding
 * 
 * @component
 * @example
 * return (
 *   <Footer />
 * )
 */
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
