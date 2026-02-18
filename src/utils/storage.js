/**
 * Wrapper for extension storage with fallback to localStorage for development.
 * Supports chrome.storage.sync and browser.storage.sync (Firefox).
 */

const isExtension =
  typeof chrome !== 'undefined' &&
  chrome.storage &&
  chrome.storage.local &&
  window.location.protocol.startsWith('chrome-extension');

export const storage = {
  get: (key) => {
    return new Promise((resolve, reject) => {
      if (isExtension) {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve(result[key]);
        });
      } else {
        try {
          const value = localStorage.getItem(key);
          resolve(value ? JSON.parse(value) : undefined);
        } catch (e) {
          console.warn('Storage Fallback (GET) Failed:', e);
          resolve(undefined);
        }
      }
    });
  },

  set: (key, value) => {
    return new Promise((resolve, reject) => {
      if (isExtension) {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve();
        });
      } else {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          resolve();
        } catch (e) {
          if (e.name === 'QuotaExceededError') {
            const msg =
              'Local Storage Quota Exceeded! Please test this as a Chrome Extension to use unlimited storage.';
            console.error(msg);
            return reject(new Error(msg));
          }
          reject(e);
        }
      }
    });
  },

  remove: (key) => {
    return new Promise((resolve, reject) => {
      if (isExtension) {
        chrome.storage.local.remove(key, () => {
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          resolve();
        });
      } else {
        try {
          localStorage.removeItem(key);
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    });
  },
};
