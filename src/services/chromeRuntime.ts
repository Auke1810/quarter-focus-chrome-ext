import { ASSETS, WINDOW, NOTIFICATIONS } from '../constants';
import type { 
  WindowOptions, 
  NotificationOptions, 
  ChromeMessage 
} from '../types';

/**
 * Chrome Runtime Service
 * Handles Chrome runtime messaging and window management
 */

/**
 * Send a message to the Chrome runtime
 * @param message - Message to send
 * @returns Response from the runtime
 */
export const sendRuntimeMessage = <T = any>(message: ChromeMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Check if a window with the specified URL already exists
 * @param url - URL to check
 * @returns True if window exists
 */
export const windowExists = async (url: string): Promise<boolean> => {
  try {
    const windows = await chrome.windows.getAll({ populate: true });
    return windows.some(window => 
      window.tabs?.some(tab => tab.url === url)
    );
  } catch (error) {
    console.error('Error checking window existence:', error);
    return false;
  }
};

/**
 * Create a new Chrome window
 * @param options - Window creation options
 * @returns Created window
 */
export const createWindow = async (options: WindowOptions): Promise<chrome.windows.Window> => {
  const { url, width = WINDOW.DEFAULT_WIDTH, height = WINDOW.DEFAULT_HEIGHT, type = 'popup' } = options;

  return await chrome.windows.create({
    url,
    width,
    height,
    type: type as 'normal' | 'popup' | 'panel',
    focused: true
  });
};

/**
 * Get the current tab
 * @returns Current tab
 */
export const getCurrentTab = async (): Promise<chrome.tabs.Tab> => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error('No active tab found');
    }
    return tab;
  } catch (error) {
    console.error('Error getting current tab:', error);
    throw error;
  }
};

/**
 * Set up a message listener
 * @param callback - Callback to handle messages
 * @returns Function to remove the listener
 */
export const addMessageListener = (
  callback: (
    message: ChromeMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => void
): (() => void) => {
  chrome.runtime.onMessage.addListener(callback);
  return () => chrome.runtime.onMessage.removeListener(callback);
};

/**
 * Request notification permissions
 * @returns True if permission granted
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    return await chrome.permissions.request({
      permissions: ['notifications']
    });
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Show a Chrome notification
 * @param options - Notification options
 * @returns Notification ID or empty string on error
 */
export const showNotification = async (options: NotificationOptions): Promise<string> => {
  try {
    const notificationOptions = {
      type: 'basic' as const,
      iconUrl: ASSETS.ICON,
      title: NOTIFICATIONS.DEFAULT_TITLE,
      message: options.message || 'Notification message'
    };
    const notificationId = await new Promise<string>((resolve) => {
      chrome.notifications.create('', notificationOptions, (id) => {
        resolve(id || '');
      });
    });
    return notificationId;
  } catch (error) {
    console.error('Error showing notification:', error);
    return '';
  }
};
