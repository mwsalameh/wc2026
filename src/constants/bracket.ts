export interface R32SlotDef {
  id: string;
  home: string;
  homeAr: string;
  away: string;
  awayAr: string;
  date: string;
  r16SlotIndex: number;
  positionInPair: 0 | 1;
}

export const ROUND_OF_32: R32SlotDef[] = [
  // --- Half A (Left side of bracket) ---
  // R16 Slot 0
  { id: 'R32-1',  home: '1st E', homeAr: 'أول المجموعة E', away: '3rd A/B/C/D/F', awayAr: 'ثالث A/B/C/D/F', date: '06/30', r16SlotIndex: 0, positionInPair: 0 },
  { id: 'R32-2',  home: '1st I', homeAr: 'أول المجموعة I', away: '3rd C/D/F/G/H', awayAr: 'ثالث C/D/F/G/H', date: '07/01', r16SlotIndex: 0, positionInPair: 1 },
  // R16 Slot 1
  { id: 'R32-3',  home: '2nd A', homeAr: 'ثاني المجموعة A', away: '2nd B', awayAr: 'ثاني المجموعة B', date: '06/28', r16SlotIndex: 1, positionInPair: 0 },
  { id: 'R32-4',  home: '1st F', homeAr: 'أول المجموعة F', away: '2nd C', awayAr: 'ثاني المجموعة C', date: '06/30', r16SlotIndex: 1, positionInPair: 1 },
  // R16 Slot 2
  { id: 'R32-5',  home: '2nd K', homeAr: 'ثاني المجموعة K', away: '2nd L', awayAr: 'ثاني المجموعة L', date: '07/03', r16SlotIndex: 2, positionInPair: 0 },
  { id: 'R32-6',  home: '1st H', homeAr: 'أول المجموعة H', away: '2nd J', awayAr: 'ثاني المجموعة J', date: '07/02', r16SlotIndex: 2, positionInPair: 1 },
  // R16 Slot 3
  { id: 'R32-7',  home: '1st D', homeAr: 'أول المجموعة D', away: '3rd B/E/F/I/J', awayAr: 'ثالث B/E/F/I/J', date: '07/02', r16SlotIndex: 3, positionInPair: 0 },
  { id: 'R32-8',  home: '1st G', homeAr: 'أول المجموعة G', away: '3rd A/E/H/I/J', awayAr: 'ثالث A/E/H/I/J', date: '07/02', r16SlotIndex: 3, positionInPair: 1 },

  // --- Half B (Right side of bracket) ---
  // R16 Slot 4
  { id: 'R32-9',  home: '1st C', homeAr: 'أول المجموعة C', away: '2nd F', awayAr: 'ثاني المجموعة F', date: '06/29', r16SlotIndex: 4, positionInPair: 0 },
  { id: 'R32-10', home: '2nd E', homeAr: 'ثاني المجموعة E', away: '2nd I', awayAr: 'ثاني المجموعة I', date: '06/30', r16SlotIndex: 4, positionInPair: 1 },
  // R16 Slot 5
  { id: 'R32-11', home: '1st A', homeAr: 'أول المجموعة A', away: '3rd C/E/F/H/I', awayAr: 'ثالث C/E/F/H/I', date: '07/01', r16SlotIndex: 5, positionInPair: 0 },
  { id: 'R32-12', home: '1st L', homeAr: 'أول المجموعة L', away: '3rd E/H/I/J/K', awayAr: 'ثالث E/H/I/J/K', date: '07/01', r16SlotIndex: 5, positionInPair: 1 },
  // R16 Slot 6
  { id: 'R32-13', home: '1st J', homeAr: 'أول المجموعة J', away: '2nd H', awayAr: 'ثاني المجموعة H', date: '07/04', r16SlotIndex: 6, positionInPair: 0 },
  { id: 'R32-14', home: '2nd D', homeAr: 'ثاني المجموعة D', away: '2nd G', awayAr: 'ثاني المجموعة G', date: '07/03', r16SlotIndex: 6, positionInPair: 1 },
  // R16 Slot 7
  { id: 'R32-15', home: '1st B', homeAr: 'أول المجموعة B', away: '3rd E/F/G/I/J', awayAr: 'ثالث E/F/G/I/J', date: '07/03', r16SlotIndex: 7, positionInPair: 0 },
  { id: 'R32-16', home: '1st K', homeAr: 'أول المجموعة K', away: '3rd D/E/I/J/L', awayAr: 'ثالث D/E/I/J/L', date: '07/04', r16SlotIndex: 7, positionInPair: 1 },
];
