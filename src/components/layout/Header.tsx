import { FunctionComponent as FC } from 'react';

/**
 * Header Component
 * 
 * Main header of the Quarter Focus application.
 * Displays the application logo and title with a distinctive styling.
 * 
 * Features:
 * - 16px Quarter Focus icon
 * - Two-part title: "Quarter Focus:" in white and "only today" in blue
 * - Dark blue background (#16233d)
 * - Consistent 0.5rem padding
 * 
 * @component
 * @example
 * return (
 *   <Header />
 * )
 */
const Header: FC = () => {
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
