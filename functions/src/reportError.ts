import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';

export const githubIssuesToken = defineSecret('GITHUB_ISSUES_TOKEN');

const GITHUB_REPO = 'mwsalameh/wc2026';
const MAX_REPORTS_PER_HOUR = 20;

interface ErrorEntry {
  timestamp: string;
  message: string;
  stack?: string;
  context?: string;
}

interface ReportErrorData {
  entry: ErrorEntry;
  recentLog: ErrorEntry[];
}

/**
 * Receives a crash/error report from the app and creates a GitHub issue.
 *
 * The GitHub token never leaves this function — it is stored as a Firebase
 * Secret and is never embedded in the app bundle. The function enforces a
 * global rate limit (20 reports/hour) so a misbehaving client cannot flood
 * the repo with issues.
 *
 * Deploy:
 *   firebase functions:secrets:set GITHUB_ISSUES_TOKEN   (paste a GitHub PAT
 *   with repo scope, or a fine-grained token with issues:write on this repo)
 *   firebase deploy --only functions
 */
export const reportAppError = onCall<ReportErrorData>(
  {
    secrets: [githubIssuesToken],
    region: 'us-central1',
    timeoutSeconds: 30,
    memory: '128MiB',
  },
  async (request) => {
    const { entry, recentLog } = request.data;

    if (!entry?.message) {
      throw new HttpsError('invalid-argument', 'entry.message is required');
    }

    const db = admin.firestore();
    const rateLimitRef = db.collection('error_reports').doc('rate_limit');
    const now = Date.now();
    const HOUR_MS = 60 * 60 * 1000;

    // Enforce global hourly cap via a Firestore transaction
    const allowed = await db.runTransaction(async (tx) => {
      const snap = await tx.get(rateLimitRef);
      const data = snap.data() as { count: number; windowStart: number } | undefined;

      if (!data || now - data.windowStart > HOUR_MS) {
        tx.set(rateLimitRef, { count: 1, windowStart: now });
        return true;
      }
      if (data.count >= MAX_REPORTS_PER_HOUR) return false;
      tx.update(rateLimitRef, { count: admin.firestore.FieldValue.increment(1) });
      return true;
    });

    // Return success silently even when rate-limited — don't hint to abusers
    if (!allowed) return { success: false };

    const token = githubIssuesToken.value();
    if (!token) return { success: false };

    const title = `🚨 App Error [${entry.context ?? 'unknown'}]: ${entry.message.slice(0, 80)}`;
    const body = [
      `## Error Details`,
      `| Field | Value |`,
      `|---|---|`,
      `| **Timestamp** | ${entry.timestamp} |`,
      `| **Context** | \`${entry.context ?? 'unknown'}\` |`,
      `| **Message** | ${entry.message} |`,
      '',
      entry.stack
        ? `### Stack Trace\n\`\`\`\n${entry.stack.slice(0, 1500)}\n\`\`\``
        : '',
      '',
      `### Recent Error Log (last ${recentLog?.length ?? 0} entries)`,
      '```json',
      JSON.stringify(recentLog ?? [], null, 2).slice(0, 2000),
      '```',
      '',
      `_Reported automatically by the WC2026 app._`,
    ].join('\n');

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ title, body, labels: ['app-error'] }),
    });

    return { success: response.ok };
  },
);
