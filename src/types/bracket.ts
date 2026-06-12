import type { Match } from './match';
import type { TournamentRound } from './match';

export interface BracketSlot {
  id: string;
  round: TournamentRound;
  match: Match | null;
  labelHome: string;
  labelAway: string;
  r16SlotIndex: number;
}

export interface BracketPair {
  slotA: BracketSlot;
  slotB: BracketSlot;
  r16SlotIndex: number;
}

export interface Bracket {
  roundOf32: BracketPair[];
  roundOf16: BracketSlot[];
  quarterFinals: BracketSlot[];
  semiFinals: BracketSlot[];
  thirdPlace: BracketSlot;
  final: BracketSlot;
}
