import React from 'react';
import usePomodoroStore from '../../store/pomodoroStore';

/**
 * DailyIntention Component
 * 
 * Displays the user's daily intention as a subheader below the main header.
 * Only renders when a daily intention is set in the strategy.
 * Styled with a distinctive background color and centered text.
 * 
 * @component
 * @example
 * return (
 *   <DailyIntention />
 * )
 */
const DailyIntention: React.FC = () => {
  const { dailyStrategy } = usePomodoroStore();
  
  // Don't render if no intention is set
  if (!dailyStrategy?.dailyIntention) return null;
  
  return (
    <div 
      className="daily-intention"
      role="complementary"
      aria-label="Daily intention"
    >
      <p className="daily-intention-text">
        "{dailyStrategy.dailyIntention}"
      </p>
    </div>
  );
};

export default DailyIntention;
