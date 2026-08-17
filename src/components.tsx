import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, layout, scale } from './theme';

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ProgressHeader({
  progress,
  onBack,
}: {
  progress: number;
  onBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Go back"
        hitSlop={14}
        onPress={onBack}
        style={styles.back}
      >
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

export function ChoiceCard({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.choiceSelected,
        pressed && styles.choicePressed,
      ]}
    >
      {icon ? <Text style={styles.choiceIcon}>{icon}</Text> : null}
      <Text style={styles.choiceLabel}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

export function EnergyChart() {
  const [chartWidth, setChartWidth] = useState(300);
  const chartScale = chartWidth / 300;
  const pinkPoints = buildPinkCurve(chartScale);
  const blackPoints = buildBlackCurve(chartScale);
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Morning Energy Levels</Text>
      <View
        style={styles.chart}
        onLayout={event => setChartWidth(event.nativeEvent.layout.width)}
      >
        <View style={styles.groggyZone} />
        <ChartPolyline
          points={pinkPoints}
          color={colors.coral}
          strokeWidth={3}
        />
        <ChartPolyline
          points={blackPoints}
          color={colors.text}
          strokeWidth={4}
        />
        <View style={styles.protocolBadge}>
          <Text style={styles.protocolText}>⚡ Wayk Protocol</Text>
        </View>
        <Text style={styles.snoozeLabel}>Snooze Cycle</Text>
        <Text style={styles.groggyLabel}>GROGGY ZONE</Text>
        <View style={styles.blackEndDot} />
        <View style={styles.redEndDot} />
        <View style={styles.chartBaseline} />
      </View>
      <Text style={styles.chartDescription}>
        Avoid the 'groggy zone'. Wayk launches{`\n`}you straight into alertness.
      </Text>
    </View>
  );
}

type ChartPoint = { x: number; y: number };

function cubicPoint(
  start: ChartPoint,
  controlOne: ChartPoint,
  controlTwo: ChartPoint,
  end: ChartPoint,
  t: number,
): ChartPoint {
  const inverse = 1 - t;
  return {
    x:
      inverse ** 3 * start.x +
      3 * inverse ** 2 * t * controlOne.x +
      3 * inverse * t ** 2 * controlTwo.x +
      t ** 3 * end.x,
    y:
      inverse ** 3 * start.y +
      3 * inverse ** 2 * t * controlOne.y +
      3 * inverse * t ** 2 * controlTwo.y +
      t ** 3 * end.y,
  };
}

function sampleCurve(curves: ChartPoint[][], chartScale: number) {
  return curves.flatMap((curve, curveIndex) =>
    Array.from({ length: 13 }, (_, index) => {
      if (curveIndex > 0 && index === 0) {
        return null;
      }
      const point = cubicPoint(
        curve[0],
        curve[1],
        curve[2],
        curve[3],
        index / 12,
      );
      return { x: point.x * chartScale, y: point.y };
    }).filter((point): point is ChartPoint => point !== null),
  );
}

function buildPinkCurve(chartScale: number) {
  return sampleCurve(
    [
      [
        { x: 10, y: 145 },
        { x: 28, y: 143 },
        { x: 38, y: 78 },
        { x: 56, y: 76 },
      ],
      [
        { x: 56, y: 76 },
        { x: 63, y: 77 },
        { x: 63, y: 138 },
        { x: 72, y: 141 },
      ],
      [
        { x: 72, y: 141 },
        { x: 91, y: 143 },
        { x: 103, y: 91 },
        { x: 124, y: 86 },
      ],
      [
        { x: 124, y: 86 },
        { x: 134, y: 87 },
        { x: 132, y: 137 },
        { x: 141, y: 139 },
      ],
      [
        { x: 141, y: 139 },
        { x: 160, y: 142 },
        { x: 173, y: 101 },
        { x: 194, y: 98 },
      ],
      [
        { x: 194, y: 98 },
        { x: 205, y: 99 },
        { x: 201, y: 137 },
        { x: 213, y: 138 },
      ],
      [
        { x: 213, y: 138 },
        { x: 242, y: 139 },
        { x: 262, y: 125 },
        { x: 278, y: 99 },
      ],
    ],
    chartScale,
  );
}

function buildBlackCurve(chartScale: number) {
  return sampleCurve(
    [
      [
        { x: 10, y: 145 },
        { x: 64, y: 145 },
        { x: 91, y: 132 },
        { x: 127, y: 105 },
      ],
      [
        { x: 127, y: 105 },
        { x: 170, y: 72 },
        { x: 213, y: 35 },
        { x: 278, y: 30 },
      ],
    ],
    chartScale,
  );
}

function ChartPolyline({
  points,
  color,
  strokeWidth,
}: {
  points: ChartPoint[];
  color: string;
  strokeWidth: number;
}) {
  return (
    <>
      {points.slice(0, -1).map((point, index) => {
        const next = points[index + 1];
        const deltaX = next.x - point.x;
        const deltaY = next.y - point.y;
        const length = Math.sqrt(deltaX ** 2 + deltaY ** 2) + 1.5;
        const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
        return (
          <View
            key={`${color}-${index}`}
            style={[
              styles.curveSegment,
              {
                left: point.x + deltaX / 2 - length / 2,
                top: point.y + deltaY / 2 - strokeWidth / 2,
                width: length,
                height: strokeWidth,
                borderRadius: strokeWidth / 2,
                backgroundColor: color,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        );
      })}
    </>
  );
}

function NumberColumn({
  value,
  values,
  onChange,
}: {
  value: number | string;
  values: Array<number | string>;
  onChange: (value: number | string) => void;
}) {
  const index = values.indexOf(value);
  const previous = values[(index - 1 + values.length) % values.length];
  const next = values[(index + 1) % values.length];
  return (
    <View style={styles.numberColumn}>
      <Pressable onPress={() => onChange(previous)} hitSlop={8}>
        <Text style={styles.wheelFaded}>{previous}</Text>
      </Pressable>
      <Text style={styles.wheelSelected}>{value}</Text>
      <Pressable onPress={() => onChange(next)} hitSlop={8}>
        <Text style={styles.wheelFaded}>{next}</Text>
      </Pressable>
    </View>
  );
}

export function TimeWheel({
  hour,
  minute,
  period,
  onChange,
}: {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
  onChange: (next: {
    hour?: number;
    minute?: number;
    period?: 'AM' | 'PM';
  }) => void;
}) {
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  return (
    <View style={styles.timeArea}>
      <Text style={styles.largeTime}>
        {hour}:{minute.toString().padStart(2, '0')} {period}
      </Text>
      <View style={styles.wheelHighlight} />
      <View style={styles.wheelRow}>
        <NumberColumn
          value={hour}
          values={hours}
          onChange={next => onChange({ hour: next as number })}
        />
        <NumberColumn
          value={minute}
          values={minutes}
          onChange={next => onChange({ minute: next as number })}
        />
        <NumberColumn
          value={period}
          values={['AM', 'PM']}
          onChange={next => onChange({ period: next as 'AM' | 'PM' })}
        />
      </View>
      <Text style={styles.wheelHint}>Tap above or below a value to adjust</Text>
    </View>
  );
}

type Point = { x: number; y: number };

export function SignaturePad({ onSigned }: { onSigned: () => void }) {
  const [points, setPoints] = useState<Point[]>([]);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const pointsRef = useRef<Point[]>([]);
  const onSignedRef = useRef(onSigned);

  useEffect(() => {
    onSignedRef.current = onSigned;
  }, [onSigned]);

  const append = (point: Point) => {
    const next = [...pointsRef.current, point];
    pointsRef.current = next;
    setPoints(next);
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: event => {
          pointsRef.current = [];
          append({
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          });
        },
        onPanResponderMove: event =>
          append({
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          }),
        onPanResponderRelease: () => {
          if (pointsRef.current.length > 4) {
            onSignedRef.current();
          }
        },
        onPanResponderTerminate: () => {
          if (pointsRef.current.length > 4) {
            onSignedRef.current();
          }
        },
      }),
    [],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View
      accessibilityLabel="Signature area"
      collapsable={false}
      onLayout={onLayout}
      style={styles.signature}
      {...responder.panHandlers}
    >
      <Text style={styles.signatureHint}>
        {points.length ? '' : 'Sign here with your finger'}
      </Text>
      {points.slice(-70).map((point, index) => (
        <View
          key={`${index}-${point.x}`}
          style={[
            styles.ink,
            {
              left: Math.max(0, Math.min(point.x, size.width - 5)),
              top: Math.max(0, Math.min(point.y, size.height - 5)),
            },
          ]}
        />
      ))}
      {points.length > 4 ? (
        <View style={styles.signedBadge}>
          <Text style={styles.signedCheck}>✓</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    borderRadius: 29,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonDisabled: { backgroundColor: colors.shadeE4E4E0 },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  buttonText: { color: colors.surface, fontSize: scale(16), fontWeight: '700' },
  buttonTextDisabled: { color: colors.shadeA5A5A0 },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.horizontal,
  },
  back: { width: 38, height: 38, justifyContent: 'center' },
  backText: {
    fontSize: scale(32),
    fontWeight: '300',
    color: colors.text,
    marginTop: -4,
  },
  headerSpacer: { width: 38 },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.faint,
  },
  progressFill: { height: 3, backgroundColor: colors.accent, borderRadius: 3 },
  choice: {
    minHeight: 66,
    borderRadius: layout.radius,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.transparent,
    shadowColor: colors.shade171711,
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  choiceSelected: { borderColor: colors.text },
  choicePressed: { transform: [{ scale: 0.99 }] },
  choiceIcon: { fontSize: scale(20), width: 36, color: colors.text },
  choiceLabel: {
    flex: 1,
    fontSize: scale(15),
    fontWeight: '600',
    color: colors.text,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.shadeD9D9D4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.text },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.text,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginTop: 30,
    shadowColor: colors.shade171711,
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  chartTitle: { fontSize: scale(13), color: colors.text, fontWeight: '600' },
  chart: { height: 180, marginTop: 12, overflow: 'hidden' },
  groggyZone: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 138,
    bottom: 20,
    backgroundColor: colors.shadeFFF1F1,
  },
  curveSegment: { position: 'absolute' },
  segment: { position: 'absolute', height: 3, borderRadius: 2 },
  redOne: {
    backgroundColor: colors.coral,
    width: 62,
    left: 10,
    top: 126,
    transform: [{ rotate: '-60deg' }],
  },
  redTwo: {
    backgroundColor: colors.coral,
    width: 55,
    left: 54,
    top: 86,
    transform: [{ rotate: '69deg' }],
  },
  redThree: {
    backgroundColor: colors.coral,
    width: 146,
    left: 96,
    top: 119,
    transform: [{ rotate: '-17deg' }],
  },
  blackOne: {
    backgroundColor: colors.text,
    width: 78,
    left: 12,
    top: 143,
    transform: [{ rotate: '-8deg' }],
  },
  blackTwo: {
    backgroundColor: colors.text,
    width: 96,
    left: 81,
    top: 117,
    transform: [{ rotate: '-29deg' }],
  },
  blackThree: {
    backgroundColor: colors.text,
    width: 112,
    left: 160,
    top: 67,
    transform: [{ rotate: '-19deg' }],
  },
  chartBaseline: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: colors.shadeE7E7E2,
  },
  protocolBadge: {
    position: 'absolute',
    left: 78,
    top: 62,
    backgroundColor: colors.text,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  protocolText: {
    fontSize: scale(10),
    fontWeight: '800',
    color: colors.surface,
  },
  snoozeLabel: {
    position: 'absolute',
    left: 95,
    bottom: 5,
    fontSize: scale(10),
    fontWeight: '700',
    color: colors.coral,
  },
  groggyLabel: {
    position: 'absolute',
    right: 10,
    bottom: 5,
    fontSize: scale(10),
    fontWeight: '800',
    color: colors.shadeF2B5B7,
  },
  blackEndDot: {
    position: 'absolute',
    right: 1,
    top: 45,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.text,
  },
  redEndDot: {
    position: 'absolute',
    right: 1,
    top: 106,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.coral,
    backgroundColor: colors.surface,
  },
  chartDescription: {
    fontSize: scale(13),
    lineHeight: scale(18),
    color: colors.muted,
    textAlign: 'center',
    marginTop: 7,
  },
  timeArea: { alignItems: 'center', marginTop: 28 },
  largeTime: {
    fontSize: scale(42),
    lineHeight: scale(52),
    fontWeight: '800',
    color: colors.text,
    letterSpacing: scale(-1.5),
  },
  wheelRow: {
    height: 154,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    zIndex: 1,
  },
  wheelHighlight: {
    position: 'absolute',
    top: 107,
    height: 46,
    width: 210,
    borderRadius: 12,
    backgroundColor: colors.shadeECECE8,
  },
  numberColumn: {
    width: 45,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 128,
  },
  wheelSelected: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
    lineHeight: scale(28),
  },
  wheelFaded: {
    fontSize: scale(16),
    color: colors.shadeB6B6B0,
    lineHeight: scale(28),
    minWidth: 40,
    textAlign: 'center',
  },
  wheelHint: { fontSize: scale(12), color: colors.muted, marginTop: 12 },
  signature: {
    height: 230,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.green,
    backgroundColor: colors.shadeFCFFFC,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureHint: { fontSize: scale(14), color: colors.shadeA4AAA5 },
  ink: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.shade173C2A,
  },
  signedBadge: {
    position: 'absolute',
    top: 72,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.green,
    shadowOpacity: 0.38,
    shadowRadius: 18,
  },
  signedCheck: {
    color: colors.surface,
    fontSize: scale(34),
    fontWeight: '700',
  },
});
