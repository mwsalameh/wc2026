import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'wc2026:errorLog';
const MAX_ENTRIES = 20;

export interface ErrorLogEntry {
  timestamp: string;
  message: string;
  stack?: string;
  context?: string;
}

// Best-effort, on-device diagnostic trail for production builds where there is
// no console to inspect. Never throws — a logging failure must not take down
// the app it's trying to diagnose.
export async function recordError(error: unknown, context?: string): Promise<void> {
  if (__DEV__) {
    console.error(context ? `[ErrorLog] [${context}]` : '[ErrorLog]', error);
  }
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const entry: ErrorLogEntry = { timestamp: new Date().toISOString(), message, stack, context };

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const entries: ErrorLogEntry[] = raw ? JSON.parse(raw) : [];
    entries.push(entry);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // Storage unavailable — nothing more we can do.
  }
}

export async function getErrorLog(): Promise<ErrorLogEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearErrorLog(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// Catches uncaught JS errors outside of React's render tree (e.g. in async
// callbacks) that React's ErrorBoundary cannot see. Safe to call once at app
// startup, before render.
export function installGlobalErrorHandler(): void {
  const errorUtils = (global as any).ErrorUtils;
  if (!errorUtils?.setGlobalHandler) return;

  const previousHandler = errorUtils.getGlobalHandler?.();
  errorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    recordError(error, isFatal ? 'global-fatal' : 'global');
    previousHandler?.(error, isFatal);
  });
}
