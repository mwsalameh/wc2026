import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import { createApiClient } from './apiClient';
import { runAggregation } from './aggregateStats';
export { reportAppError } from './reportError';

admin.initializeApp();
const db = admin.firestore();

// Stored as a Firebase Secret (not an env var) so the key never appears in
// function source or logs. Set it once with:
//   firebase functions:secrets:set APISPORTS_KEY
const apiSportsKey = defineSecret('APISPORTS_KEY');

/**
 * Runs every 10 minutes and aggregates WC2026 player/team/POTM statistics
 * into /wc2026stats/aggregated in Firestore.
 *
 * Most runs (when no match just finished) return immediately after a single
 * fixtures-list API call. Full re-aggregation only happens when new FT matches
 * are detected.
 *
 * Deploy:
 *   cd functions && npm install
 *   firebase functions:secrets:set APISPORTS_KEY   (paste your api-sports key)
 *   firebase deploy --only functions
 *
 * Firestore plan requirement: Firebase Blaze (pay-as-you-go) for outbound
 * network access. Typical cost at this schedule: ~$0/month (well within the
 * 2M free invocations and the free Firestore read/write tiers).
 */
export const aggregateWcStats = onSchedule(
  {
    schedule: 'every 10 minutes',
    secrets: [apiSportsKey],
    timeoutSeconds: 300,
    memory: '256MiB',
    region: 'us-central1',
  },
  async () => {
    const client = createApiClient(apiSportsKey.value());
    await runAggregation(db, client);
  },
);
