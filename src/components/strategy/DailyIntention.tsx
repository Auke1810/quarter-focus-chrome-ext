import React from 'react';
import usePomodoroStore from '../../store/pomodoroStore';

const DailyIntention: React.FC = () => {
  const { dailyStrategy } = usePomodoroStore();
  
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
