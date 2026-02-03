import { atom, onMount } from 'nanostores';

type StorageValue = string | null;

interface StorageBackend {
  getItem: (key: string) => StorageValue;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

const memoryStorage = new Map<string, string>();

function getStorageBackend(): StorageBackend {
  if (typeof window === 'undefined') {
    return {
      getItem: (key) => memoryStorage.get(key) ?? null,
      setItem: (key, value) => { memoryStorage.set(key, value); },
      removeItem: (key) => { memoryStorage.delete(key); },
    };
  }

  return {
    getItem: (key) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryStorage.get(key) ?? null;
      }
    },
    setItem: (key, value) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        memoryStorage.set(key, value);
      }
    },
    removeItem: (key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
      memoryStorage.delete(key);
    },
  };
}

const storage = getStorageBackend();

interface PersistentOptions<T> {
  encode?: (value: T) => string | undefined;
  decode?: (value: string) => T;
  listen?: boolean;
}

const identityEncode = <T>(value: T): string => String(value);
const identityDecode = <T>(value: string): T => value as unknown as T;

export function persistentAtom<T>(
  key: string,
  initial: T,
  opts: PersistentOptions<T> = {}
) {
  const encode = opts.encode ?? identityEncode;
  const decode = opts.decode ?? identityDecode;

  const store = atom<T>(initial);
  const baseSet = store.set;

  store.set = (newValue: T) => {
    const encoded = encode(newValue);
    if (typeof encoded === 'undefined') {
      storage.removeItem(key);
    } else {
      storage.setItem(key, encoded);
    }
    baseSet(newValue);
  };

  const restore = () => {
    const raw = storage.getItem(key);
    if (raw === null) {
      baseSet(initial);
      return;
    }
    try {
      baseSet(decode(raw));
    } catch {
      baseSet(initial);
    }
  };

  const listener = (event: StorageEvent) => {
    if (!event.key) {
      restore();
      return;
    }
    if (event.key !== key) return;
    if (event.newValue === null) {
      baseSet(initial);
      return;
    }
    try {
      baseSet(decode(event.newValue));
    } catch {
      baseSet(initial);
    }
  };

  onMount(store, () => {
    restore();

    if (opts.listen === false || typeof window === 'undefined') {
      return undefined;
    }

    window.addEventListener('storage', listener);
    window.addEventListener('pageshow', restore);

    return () => {
      window.removeEventListener('storage', listener);
      window.removeEventListener('pageshow', restore);
    };
  });

  return store;
}

export function persistentBoolean(
  key: string,
  initial: boolean = false,
  opts: Omit<PersistentOptions<boolean>, 'encode' | 'decode'> = {}
) {
  return persistentAtom<boolean>(key, initial, {
    ...opts,
    encode: (value) => (value ? 'yes' : undefined),
    decode: (value) => value === 'yes',
  });
}
