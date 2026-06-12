import { useMemo } from 'react';
import { useAllFixtures } from './useFixtures';
import { useLanguageStore } from '@/store/languageStore';
import { ROUND_OF_32, type R32SlotDef } from '@/constants/bracket';
import { getTeamNameAr } from '@/constants/teamNamesAr';
import type { BracketSlotData } from '@/components/bracket/BracketSlot';

export interface BracketData {
  r32: BracketSlotData[][];  // [leftHalf[8], rightHalf[8]]
  r16: BracketSlotData[][];
  qf: BracketSlotData[][];
  sf: BracketSlotData[][];
  final: BracketSlotData | null;
  thirdPlace: BracketSlotData | null;
}

// ── Match numbering ───────────────────────────────────────────────────────────
// R32 : M1 – M16   (r16SlotIndex * 2 + positionInPair + 1)
// R16 : M17 – M24  (r16SlotIndex + 17)
// QF  : M25 – M28
// SF  : M29 – M30
// Final : M31
// ─────────────────────────────────────────────────────────────────────────────

function r32Num(r16SlotIndex: number, positionInPair: number): number {
  return r16SlotIndex * 2 + positionInPair + 1;
}
function r16Num(r16SlotIndex: number): number {
  return r16SlotIndex + 17; // 0→17 … 7→24
}

// "Winner of Match N" label — compact for the small slot width
function wm(n: number, isAr: boolean): string {
  return isAr ? `ف.م${n}` : `W.M${n}`;
}
function lm(n: number, isAr: boolean): string {
  return isAr ? `خ.م${n}` : `L.M${n}`;
}

export const useBracketData = (): BracketData => {
  const { data: fixtures } = useAllFixtures();
  const { language } = useLanguageStore();

  return useMemo<BracketData>(() => {
    const isAr = language === 'ar';

    function translate(englishName: string): string {
      return isAr ? getTeamNameAr(englishName) : englishName;
    }

    const r32Fixtures = fixtures?.filter((f) => f.round === 'Round of 32') ?? [];
    const r16Fixtures = fixtures?.filter((f) => f.round === 'Round of 16')
      .sort((a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime()) ?? [];
    const qfFixtures = fixtures?.filter((f) => f.round === 'Quarter-Finals')
      .sort((a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime()) ?? [];
    const sfFixtures = fixtures?.filter((f) => f.round === 'Semi-Finals')
      .sort((a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime()) ?? [];
    const finalFixture = fixtures?.find((f) => f.round === 'Final') ?? null;
    const thirdPlaceFixture = fixtures?.find((f) => f.round === 'Third Place') ?? null;

    function fixtureToSlot(
      f: typeof r32Fixtures[0],
      extras?: Partial<BracketSlotData>
    ): BracketSlotData {
      return {
        homeLabel: translate(f.homeTeam.name),
        awayLabel: translate(f.awayTeam.name),
        homeLogo: f.homeTeam.logoUrl,
        awayLogo: f.awayTeam.logoUrl,
        homeId: f.homeTeam.id,
        awayId: f.awayTeam.id,
        homeScore: f.score.home,
        awayScore: f.score.away,
        matchId: f.id,
        status: f.status,
        ...extras,
      };
    }

    const r32FixturesSorted = [...r32Fixtures].sort(
      (a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime()
    );

    const leftR32Defs = ROUND_OF_32.filter((d) => d.r16SlotIndex <= 3)
      .sort((a, b) => a.r16SlotIndex * 2 + a.positionInPair - (b.r16SlotIndex * 2 + b.positionInPair));
    const rightR32Defs = ROUND_OF_32.filter((d) => d.r16SlotIndex >= 4)
      .sort((a, b) => a.r16SlotIndex * 2 + a.positionInPair - (b.r16SlotIndex * 2 + b.positionInPair));

    // R32: show qualification placeholders, no match number in the slot UI
    function defsToSlots(defs: R32SlotDef[]): BracketSlotData[] {
      return defs.map((def) => {
        const fixture = r32FixturesSorted.find(
          (f) =>
            f.homeTeam.name.includes(def.home.split(' ')[1] ?? '') ||
            f.awayTeam.name.includes(def.away.split(' ')[1] ?? '')
        );
        if (fixture) return fixtureToSlot(fixture);

        return {
          homeLabel: isAr ? def.homeAr : def.home,
          awayLabel: isAr ? def.awayAr : def.away,
          isTBD: true,
        };
      });
    }

    const leftR32 = defsToSlots(leftR32Defs);
    const rightR32 = defsToSlots(rightR32Defs);

    // R16: 8 slots — show "W.MX vs W.MY" and match number in divider
    function buildR16Slot(
      r16SlotIdx: number,
      fixture?: typeof r16Fixtures[0]
    ): BracketSlotData {
      const mNum = r16Num(r16SlotIdx);
      if (fixture) return fixtureToSlot(fixture, { matchNumber: mNum });
      const homeR32 = r32Num(r16SlotIdx, 0);
      const awayR32 = r32Num(r16SlotIdx, 1);
      return {
        homeLabel: wm(homeR32, isAr),
        awayLabel: wm(awayR32, isAr),
        matchNumber: mNum,
        isTBD: true,
      };
    }

    // Left R16: r16SlotIndex 0-3 → match numbers 17-20
    const leftR16 = [0, 1, 2, 3].map((i) =>
      buildR16Slot(i, r16Fixtures[i])
    );
    // Right R16: r16SlotIndex 4-7 → match numbers 21-24
    const rightR16 = [4, 5, 6, 7].map((i, pos) =>
      buildR16Slot(i, r16Fixtures[pos + 4])
    );

    // QF: 4 slots — M25-M28
    // leftQF[0]=M25 (W.M17 vs W.M18), leftQF[1]=M26 (W.M19 vs W.M20)
    // rightQF[0]=M27 (W.M21 vs W.M22), rightQF[1]=M28 (W.M23 vs W.M24)
    function buildQFSlot(
      qfIndex: number,   // 0-3 globally
      fixture?: typeof qfFixtures[0]
    ): BracketSlotData {
      const mNum = 25 + qfIndex;
      if (fixture) return fixtureToSlot(fixture, { matchNumber: mNum });
      const homeR16 = 17 + qfIndex * 2;
      const awayR16 = 18 + qfIndex * 2;
      return {
        homeLabel: wm(homeR16, isAr),
        awayLabel: wm(awayR16, isAr),
        matchNumber: mNum,
        isTBD: true,
      };
    }

    const leftQF = [0, 1].map((i) => buildQFSlot(i, qfFixtures[i]));
    const rightQF = [2, 3].map((i) => buildQFSlot(i, qfFixtures[i]));

    // SF: 2 slots — M29, M30
    function buildSFSlot(
      sfIndex: number,  // 0 or 1
      fixture?: typeof sfFixtures[0]
    ): BracketSlotData {
      const mNum = 29 + sfIndex;
      if (fixture) return fixtureToSlot(fixture, { matchNumber: mNum });
      const homeQF = 25 + sfIndex * 2;
      const awayQF = 26 + sfIndex * 2;
      return {
        homeLabel: wm(homeQF, isAr),
        awayLabel: wm(awayQF, isAr),
        matchNumber: mNum,
        isTBD: true,
      };
    }

    const leftSF = [buildSFSlot(0, sfFixtures[0])];
    const rightSF = [buildSFSlot(1, sfFixtures[1])];

    // Final — M31, always show trophy
    const finalSlot: BracketSlotData = finalFixture
      ? fixtureToSlot(finalFixture, { matchNumber: 31, showTrophy: true })
      : {
          homeLabel: wm(29, isAr),
          awayLabel: wm(30, isAr),
          matchNumber: 31,
          showTrophy: true,
          isTBD: true,
        };

    // 3rd Place — show losers of SF
    const thirdSlot: BracketSlotData = thirdPlaceFixture
      ? fixtureToSlot(thirdPlaceFixture, { matchNumber: 32 })
      : {
          homeLabel: lm(29, isAr),
          awayLabel: lm(30, isAr),
          matchNumber: 32,
          isTBD: true,
        };

    return {
      r32: [leftR32, rightR32],
      r16: [leftR16, rightR16],
      qf: [leftQF, rightQF],
      sf: [leftSF, rightSF],
      final: finalSlot,
      thirdPlace: thirdSlot,
    };
  }, [fixtures, language]);
};
