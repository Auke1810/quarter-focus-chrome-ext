/**
 * Check if a given date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: string): boolean => {
  const today = new Date();
  const compareDate = new Date(date);
  
  return (
    today.getFullYear() === compareDate.getFullYear() &&
    today.getMonth() === compareDate.getMonth() &&
    today.getDate() === compareDate.getDate()
  );
};
