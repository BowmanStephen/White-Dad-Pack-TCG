import { setPersistentEngine, windowPersistentEvents } from '@nanostores/persistent';

type StorageLike = Record<string, string | undefined> & {
  getItem?: (key: string) => string | null;
  setItem?: (key: string, value: string) => void;
  removeItem?: (key: string) => void;
  key?: (index: number) => string | null;
  length?: number;
};

const memoryStorage = new Map<string, string>();

function canUseLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

const nativeStorage = canUseLocalStorage() ? localStorage : null;

function safeGetItem(key: string): string | undefined {
  if (nativeStorage) {
    try {
      const value = nativeStorage.getItem(key);
      if (value !== null) return value;
    } catch {
      // Ignore and fallback to memory.
    }
  }

  return memoryStorage.get(key);
}

function safeSetItem(key: string, value: string): void {
  if (nativeStorage) {
    try {
      nativeStorage.setItem(key, value);
      return;
    } catch {
      // Ignore and fallback to memory.
    }
  }

  memoryStorage.set(key, value);
}

function safeRemoveItem(key: string): void {
  if (nativeStorage) {
    try {
      nativeStorage.removeItem(key);
    } catch {
      // Ignore and fallback to memory.
    }
  }

  memoryStorage.delete(key);
}

function getAllKeys(): string[] {
  const keys = new Set<string>();

  if (nativeStorage) {
    try {
      for (let i = 0; i < nativeStorage.length; i += 1) {
        const key = nativeStorage.key(i);
        if (key) keys.add(key);
      }
    } catch {
      // Ignore and fallback to memory.
    }
  }

  for (const key of memoryStorage.keys()) {
    keys.add(key);
  }

  return [...keys];
}

const safeStorage: StorageLike = new Proxy<StorageLike>({} as StorageLike, {
  get(_target, prop) {
    if (typeof prop !== 'string') return undefined;

    if (prop === 'length') return getAllKeys().length;
    if (prop === 'key') return (index: number) => getAllKeys()[index] ?? null;
    if (prop === 'getItem') return (key: string) => safeGetItem(key) ?? null;
    if (prop === 'setItem') return (key: string, value: string) => safeSetItem(key, value);
    if (prop === 'removeItem') return (key: string) => safeRemoveItem(key);

    return safeGetItem(prop);
  },
  set(_target, prop, value) {
    if (typeof prop !== 'string') return false;
    safeSetItem(prop, String(value));
    return true;
  },
  deleteProperty(_target, prop) {
    if (typeof prop !== 'string') return true;
    safeRemoveItem(prop);
    return true;
  },
  ownKeys() {
    return getAllKeys();
  },
  getOwnPropertyDescriptor(_target, prop) {
    if (typeof prop !== 'string') return undefined;
    return { enumerable: true, configurable: true };
  },
});

if (typeof window !== 'undefined') {
  setPersistentEngine(safeStorage, windowPersistentEvents);
}
