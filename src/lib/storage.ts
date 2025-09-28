const memoryStorage = (() => {
  const store = new Map<string, string>()
  return {
    getItem(key: string) {
      return store.get(key) ?? null
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
    removeItem(key: string) {
      store.delete(key)
    },
  }
})()

export const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export function getStorage() {
  if (isBrowser) {
    return window.localStorage
  }
  return memoryStorage
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = getStorage().getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn('[storage] failed to read key', key, error)
    return fallback
  }
}

export function writeJson<T>(key: string, value: T) {
  try {
    getStorage().setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('[storage] failed to write key', key, error)
  }
}

export function remove(key: string) {
  try {
    getStorage().removeItem(key)
  } catch (error) {
    console.warn('[storage] failed to remove key', key, error)
  }
}
