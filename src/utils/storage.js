// localStorage helpers cho LunchSync

const PREFIX = 'lunchsync-';

export const storage = {
  get: (key, fallback = null) => {
    try {
      const value = localStorage.getItem(PREFIX + key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Ignore quota exceeded
    }
  },

  remove: (key) => {
    localStorage.removeItem(PREFIX + key);
  },

  clear: () => {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },
};
