type WebStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const createWebStorage = (type: 'local' | 'session'): WebStorage => {
  const storage =
    type === 'local' ? window.localStorage : window.sessionStorage;
  return {
    getItem: (key) => Promise.resolve(storage.getItem(key)),
    setItem: (key, value) => {
      storage.setItem(key, value);
      return Promise.resolve();
    },
    removeItem: (key) => {
      storage.removeItem(key);
      return Promise.resolve();
    },
  };
};

export const localStorageEngine = createWebStorage('local');
export const sessionStorageEngine = createWebStorage('session');
