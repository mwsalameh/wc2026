import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'wc2026:errorLog';
const LAST_REPORT_KEY = 'wc2026:lastErrorReport';
const MAX_ENTRIES = 20;
const REPORT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour between GitHub issue reports
const GITHUB_REPO = 'mwsalameh/wc2026';
const GITHUB_TOKEN = process.env.EXPO_PUBLIC_GITHUB_ISSUES_TOKEN ?? '';

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

    // Report critical errors (fatal crashes and render errors) to GitHub
    const isCritical = context === 'global-fatal' || context === 'render';
    if (isCritical && !__DEV__) {
      reportErrorToGitHub(entry, entries.slice(-5));
    }
  } catch {
    // Storage unavailable — nothing more we can do.
  }
}

async function reportErrorToGitHub(
  entry: ErrorLogEntry,
  recentLog: ErrorLogEntry[],
): Promise<void> {
  if (!GITHUB_TOKEN) return;
  try {
    const lastReport = await AsyncStorage.getItem(LAST_REPORT_KEY);
    if (lastReport && Date.now() - parseInt(lastReport) < REPORT_COOLDOWN_MS) return;

    const title = `🚨 App Error [${entry.context}]: ${entry.message.slice(0, 80)}`;
    const body = [
      `## Error Details`,
      `| Field | Value |`,
      `|---|---|`,
      `| **Timestamp** | ${entry.timestamp} |`,
      `| **Context** | \`${entry.context}\` |`,
      `| **Message** | ${entry.message} |`,
      '',
      entry.stack
        ? `### Stack Trace\n\`\`\`\n${entry.stack.slice(0, 1500)}\n\`\`\``
        : '',
      '',
      `### Recent Error Log (last ${recentLog.length})`,
      '```json',
      JSON.stringify(recentLog, null, 2),
      '```',
      '',
      `_Reported automatically by the app. See \`src/utils/errorLog.ts\` for details._`,
    ].join('\n');

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ title, body, labels: ['app-error'] }),
    });

    if (response.ok) {
      await AsyncStorage.setItem(LAST_REPORT_KEY, Date.now().toString());
    }
  } catch {
    // Network unavailable — will retry after cooldown expires.
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
