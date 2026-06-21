import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const STORAGE_KEY = 'wc2026:errorLog';
const LAST_REPORT_KEY = 'wc2026:lastErrorReport';
const MAX_ENTRIES = 20;
const REPORT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour between reports per device

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

    // Only report critical errors in production — Cloud Function holds the
    // GitHub token securely; no token is stored in the app bundle.
    const isCritical = context === 'global-fatal' || context === 'render';
    if (isCritical && !__DEV__) {
      reportErrorViaFunction(entry, entries.slice(-5));
    }
  } catch {
    // Storage unavailable — nothing more we can do.
  }
}

async function reportErrorViaFunction(
  entry: ErrorLogEntry,
  recentLog: ErrorLogEntry[],
): Promise<void> {
  try {
    const lastReport = await AsyncStorage.getItem(LAST_REPORT_KEY);
    if (lastReport && Date.now() - parseInt(lastReport) < REPORT_COOLDOWN_MS) return;

    const reportAppError = httpsCallable(functions, 'reportAppError');
    const result = await reportAppError({ entry, recentLog });

    if ((result.data as { success: boolean }).success) {
      await AsyncStorage.setItem(LAST_REPORT_KEY, Date.now().toString());
    }
  } catch {
    // Network unavailable or function not deployed yet — fail silently.
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
