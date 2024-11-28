import { useState } from 'react';
import { requestNotificationPermission, showNotification } from '../services/chromeRuntime';
import { ASSETS } from '../constants';

export const useSound = () => {
  const [notificationSound] = useState(new Audio(chrome.runtime.getURL('notification.wav')));
  const [completionSound] = useState(new Audio(chrome.runtime.getURL('complete.wav')));
  const [hasPermission, setHasPermission] = useState(false);

  const ensurePermissions = async () => {
    if (!hasPermission) {
      try {
        const granted = await requestNotificationPermission();
        setHasPermission(granted);
        return granted;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return true;
  };

  const playNotificationSound = async (message) => {
    try {
      await notificationSound.play();
      
      if (hasPermission) {
        await showNotification({
          title: 'Quarter Focus',
          message: message || 'Time to take a break!',
          priority: 2,
          iconUrl: chrome.runtime.getURL(ASSETS.ICON)
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
          priority: 2,
          iconUrl: chrome.runtime.getURL(ASSETS.ICON)
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
