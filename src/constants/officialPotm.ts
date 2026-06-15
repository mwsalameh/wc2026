// Official FIFA Player of the Match selections for WC 2026.
//
// HOW TO ADD AN ENTRY
// -------------------
// 1. After a match finishes, open the match in the app.
//    The fixture ID is the number in the URL: /match/[id]
// 2. FIFA announces the official POTM on their website after the final whistle.
// 3. Add the entry below using the player name EXACTLY as api-football returns it.
//    The dev-mode MISS log prints both the fixture ID and the highest-rated player
//    name (with their rating) so you can cross-reference.
//
// FORMAT
// ------
//   [fixtureId]: { playerName: 'Exact Name From API' },
//
// The playerName must match api-football's spelling precisely (it is used to look
// up the player's photo and team from the fixture players response).

interface OfficialEntry {
  playerName: string;
}

const OFFICIAL_POTM: Record<number, OfficialEntry> = {
  // ── Group Stage — Day 1 ──────────────────────────────────────────────────────
  // Add entries here as matches are played and FIFA announces the award.
  //
  // Example (replace with real data):
  // 1234567: { playerName: 'Xherdan Shaqiri' },
};

export function getOfficialPotm(fixtureId: number): OfficialEntry | null {
  return OFFICIAL_POTM[fixtureId] ?? null;
}
