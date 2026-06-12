import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { BracketSlot, SLOT_H, SLOT_W } from './BracketSlot';
import type { BracketSlotData } from './BracketSlot';

const SLOT_GAP = 8;
const SLOT_UNIT = SLOT_H + SLOT_GAP;
const ROUND_GAP = 10;
const LABEL_H = 20;
const BRACKET_H = 8 * SLOT_UNIT;

function getSlotTop(roundIndex: number, slotIndex: number): number {
  const slotsPerUnit = Math.pow(2, roundIndex);
  const unitH = slotsPerUnit * SLOT_UNIT;
  return slotIndex * unitH + (unitH - SLOT_H) / 2;
}

interface RoundColumnProps {
  slots: BracketSlotData[];
  roundIndex: number;
  label: string;
}

function RoundColumn({ slots, roundIndex, label }: RoundColumnProps) {
  return (
    <View style={{ width: SLOT_W }}>
      <Text style={styles.roundLabel}>{label}</Text>
      <View style={{ height: BRACKET_H, position: 'relative' }}>
        {slots.map((slot, i) => (
          <View
            key={i}
            style={[
              styles.slotWrapper,
              { top: getSlotTop(roundIndex, i), width: SLOT_W, height: SLOT_H },
            ]}
          >
            <BracketSlot slot={slot} width={SLOT_W} height={SLOT_H} />
          </View>
        ))}
      </View>
    </View>
  );
}

interface BracketTreeProps {
  r32: BracketSlotData[][];
  r16: BracketSlotData[][];
  qf: BracketSlotData[][];
  sf: BracketSlotData[][];
  final: BracketSlotData | null;
  thirdPlace: BracketSlotData | null;
}

export function BracketTree({ r32, r16, qf, sf, final: finalSlot, thirdPlace }: BracketTreeProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator
      contentContainerStyle={styles.container}
    >
      {/* Left Half A */}
      <RoundColumn slots={r32[0] ?? []} roundIndex={0} label={t('bracket.roundOf32')} />
      <View style={{ width: ROUND_GAP }} />
      <RoundColumn slots={r16[0] ?? []} roundIndex={1} label={t('bracket.roundOf16')} />
      <View style={{ width: ROUND_GAP }} />
      <RoundColumn slots={qf[0] ?? []} roundIndex={2} label={t('bracket.quarterFinals')} />
      <View style={{ width: ROUND_GAP }} />
      <RoundColumn slots={sf[0] ?? []} roundIndex={3} label={t('bracket.semiFinals')} />

      {/* Center: Final */}
      <View style={{ width: ROUND_GAP }} />
      <View style={{ width: SLOT_W }}>
        <Text style={[styles.roundLabel, styles.finalLabel]}>{t('bracket.final')}</Text>
        <View style={{ height: BRACKET_H, position: 'relative' }}>
          <View
            style={[
              styles.slotWrapper,
              { top: getSlotTop(3, 0), width: SLOT_W, height: SLOT_H },
            ]}
          >
            {finalSlot && (
              <BracketSlot slot={finalSlot} width={SLOT_W} height={SLOT_H} />
            )}
          </View>
          <View
            style={[
              styles.slotWrapper,
              styles.thirdPlaceSlot,
              { width: SLOT_W, height: SLOT_H },
            ]}
          >
            <Text style={styles.thirdPlaceLabel}>{t('bracket.thirdPlace')}</Text>
            {thirdPlace && (
              <BracketSlot slot={thirdPlace} width={SLOT_W} height={SLOT_H} />
            )}
          </View>
        </View>
      </View>

      {/* Right Half B (mirrored: SF → QF → R16 → R32) */}
      <View style={{ width: ROUND_GAP }} />
      <RoundColumn slots={sf[1] ?? []} roundIndex={3} label={t('bracket.semiFinals')} />
      <View style={{ width: ROUND_GAP }} />
      <RoundColumn slots={qf[1] ?? []} roundIndex={2} label={t('bracket.quarterFinals')} />
      <View style={{ width: ROUND_GAP }} />
      <RoundColumn slots={r16[1] ?? []} roundIndex={1} label={t('bracket.roundOf16')} />
      <View style={{ width: ROUND_GAP }} />
      <RoundColumn slots={r32[1] ?? []} roundIndex={0} label={t('bracket.roundOf32')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    alignItems: 'flex-start',
  },
  roundLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    height: LABEL_H,
    marginBottom: spacing.xs,
  },
  finalLabel: {
    color: colors.gold,
  },
  slotWrapper: {
    position: 'absolute',
  },
  thirdPlaceSlot: {
    bottom: -SLOT_H - spacing.xl,
    top: undefined,
  },
  thirdPlaceLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
});
