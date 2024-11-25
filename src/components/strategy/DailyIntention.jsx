import React from 'react';

const DailyIntention = ({ intention }) => {
  if (!intention) return null;
  
  return (
    <div className="text-center mb-4">
      <p className="text-sm sm:text-base text-gray-600 italic">
        "{intention}"
      </p>
    </div>
  );
};

export default DailyIntention;
