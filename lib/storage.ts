const STORAGE_PREFIX = 'spacedraw:v1:';

let isStorageAvailable = true;
const memoryStore: Record<string, string> = {};

function checkStorage(): boolean {
  try {
    const testKey = `${STORAGE_PREFIX}test`;
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

if (typeof window !== 'undefined') {
  isStorageAvailable = checkStorage();
}

export function getItem<T>(key: string, defaultValue: T): T {
  const fullKey = STORAGE_PREFIX + key;
  try {
    if (isStorageAvailable && typeof window !== 'undefined') {
      const item = window.localStorage.getItem(fullKey);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } else {
      const item = memoryStore[fullKey];
      return item ? (JSON.parse(item) as T) : defaultValue;
    }
  } catch (e) {
    console.warn(`[SpaceDraw Storage] Failed to read ${key}, returning default.`, e);
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): boolean {
  const fullKey = STORAGE_PREFIX + key;
  try {
    const serialized = JSON.stringify(value);
    if (isStorageAvailable && typeof window !== 'undefined') {
      window.localStorage.setItem(fullKey, serialized);
    }
    memoryStore[fullKey] = serialized;
    return true;
  } catch (e) {
    console.warn(`[SpaceDraw Storage] Failed to save ${key}.`, e);
    return false;
  }
}

export function clearData(): void {
  try {
    if (isStorageAvailable && typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    }
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
  } catch (e) {
    console.warn('[SpaceDraw Storage] Error clearing local data', e);
  }
}

export function getStorageAvailable(): boolean {
  return isStorageAvailable;
}
