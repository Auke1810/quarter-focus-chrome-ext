import { useState, useEffect } from 'react';
import { requestNotificationPermission, showNotification } from '../services/chromeRuntime';

export const useSound = () => {
  const [notificationSound] = useState(new Audio(chrome.runtime.getURL('notification.mp3')));
  const [completionSound] = useState(new Audio(chrome.runtime.getURL('completion.mp3')));
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const granted = await requestNotificationPermission();
      setHasPermission(granted);
    };

    checkPermissions();
  }, []);

  const playNotificationSound = async (message) => {
    try {
      await notificationSound.play();
      
      if (hasPermission) {
        await showNotification({
          title: 'Quarter Focus',
          message: message || 'Time to take a break!',
          priority: 2
        });
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const playCompletionSound = async (message) => {
    try {
      await completionSound.play();
      
      if (hasPermission) {
        await showNotification({
          title: 'Quarter Focus',
          message: message || 'Great job completing your session!',
          priority: 2
        });
      }
    } catch (error) {
      console.error('Error playing completion sound:', error);
    }
  };

  return {
    playNotificationSound,
    playCompletionSound,
    hasPermission
  };
};
