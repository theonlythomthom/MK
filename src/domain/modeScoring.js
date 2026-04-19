export const FMT = {
  '1v1': { label: '1 vs 1', pc: 2, team: false, ts: 1, teamCount: 2 },
  '2ffa': { label: '2 Spieler', pc: 2, team: false, ts: 1, teamCount: 2 },
  '3ffa': { label: '3 Spieler', pc: 3, team: false, ts: 1, teamCount: 3 },
  '4ffa': { label: '4 Spieler', pc: 4, team: false, ts: 1, teamCount: 4 },
  '5ffa': { label: '5 Spieler', pc: 5, team: false, ts: 1, teamCount: 5 },
  '6ffa': { label: '6 Spieler', pc: 6, team: false, ts: 1, teamCount: 6 },
  '8ffa': { label: '8 Spieler', pc: 8, team: false, ts: 1, teamCount: 8 },
  '10ffa': { label: '10 Spieler', pc: 10, team: false, ts: 1, teamCount: 10 },
  '12ffa': { label: '12 Spieler', pc: 12, team: false, ts: 1, teamCount: 12 },
  '16ffa': { label: '16 Spieler', pc: 16, team: false, ts: 1, teamCount: 16 },
  '24ffa': { label: '24 Spieler', pc: 24, team: false, ts: 1, teamCount: 24 },
  '2v2': { label: '2 vs 2', pc: 4, team: true, ts: 2, teamCount: 2 },
  '3v3': { label: '3 vs 3', pc: 6, team: true, ts: 3, teamCount: 2 },
  '4v4': { label: '4 vs 4', pc: 8, team: true, ts: 4, teamCount: 2 },
  '5v5': { label: '5 vs 5', pc: 10, team: true, ts: 5, teamCount: 2 },
  '6v6': { label: '6 vs 6', pc: 12, team: true, ts: 6, teamCount: 2 },
  '8v8': { label: '8 vs 8', pc: 16, team: true, ts: 8, teamCount: 2 },
  '12v12': { label: '12 vs 12', pc: 24, team: true, ts: 12, teamCount: 2 },
  '3x2': { label: '3 × 2er Teams', pc: 6, team: true, ts: 2, teamCount: 3 },
  '4x2': { label: '4 × 2er Teams', pc: 8, team: true, ts: 2, teamCount: 4 },
  '6x2': { label: '6 × 2er Teams', pc: 12, team: true, ts: 2, teamCount: 6 },
  '8x2': { label: '8 × 2er Teams', pc: 16, team: true, ts: 2, teamCount: 8 },
  '12x2': { label: '12 × 2er Teams', pc: 24, team: true, ts: 2, teamCount: 12 },
  '3x3': { label: '3 × 3er Teams', pc: 9, team: true, ts: 3, teamCount: 3 },
  '4x3': { label: '4 × 3er Teams', pc: 12, team: true, ts: 3, teamCount: 4 },
  '8x3': { label: '8 × 3er Teams', pc: 24, team: true, ts: 3, teamCount: 8 },
  '3x4': { label: '3 × 4er Teams', pc: 12, team: true, ts: 4, teamCount: 3 },
  '4x4': { label: '4 × 4er Teams', pc: 16, team: true, ts: 4, teamCount: 4 },
  '4x6': { label: '4 × 6er Teams', pc: 24, team: true, ts: 6, teamCount: 4 },
};

export const DRAW_MODES = {
  track: 'Einzelstrecken',
  cup: 'Ganze Cups',
  route: 'K.O.-Verläufe',
};

export const STECHEN_PTS = [5, 3, 1, 0];

export function rszPts(points, slotCount) {
  const safePoints = Array.isArray(points) ? points.map((value) => Number(value) || 0) : [];
  const safeSlotCount = Math.max(0, Number(slotCount) || 0);

  if (safePoints.length === safeSlotCount) return safePoints;
  if (safePoints.length > safeSlotCount) return safePoints.slice(0, safeSlotCount);

  return [...safePoints, ...Array(Math.max(0, safeSlotCount - safePoints.length)).fill(0)];
}

export function stechenPts(rank) {
  const pos = Number(rank) || 0;
  return pos > 0 ? (STECHEN_PTS[pos - 1] ?? 0) : 0;
}

export function getModeFormatMeta(modeOrFormatId) {
  if (typeof modeOrFormatId === 'string') return FMT[modeOrFormatId] || null;
  const formatId = modeOrFormatId?.sf || modeOrFormatId?.formatId || modeOrFormatId;
  return FMT[formatId] || null;
}

export function areTeamPointChunksUniform(points, teamSize, teamCount) {
  const safePoints = Array.isArray(points) ? points.map((value) => Number(value) || 0) : [];
  const safeTeamSize = Math.max(1, Number(teamSize) || 1);
  const safeTeamCount = Math.max(1, Number(teamCount) || 1);

  if (safePoints.length !== safeTeamSize * safeTeamCount) return false;

  for (let teamIndex = 0; teamIndex < safeTeamCount; teamIndex += 1) {
    const start = teamIndex * safeTeamSize;
    const chunk = safePoints.slice(start, start + safeTeamSize);
    if (chunk.length !== safeTeamSize) return false;
    if (!chunk.every((value) => value === chunk[0])) return false;
  }

  return true;
}

export function getModeScoringMode(mode, fmt = getModeFormatMeta(mode)) {
  if (!fmt?.team) return 'individual';

  const raw = String(mode?.scoringMode || mode?.teamScoring || '').toLowerCase();
  if (raw === 'team' || raw === 'individual') return raw;

  const safePoints = Array.isArray(mode?.points) ? mode.points.map((value) => Number(value) || 0) : [];
  if (safePoints.length === fmt.teamCount) return 'team';
  if (areTeamPointChunksUniform(safePoints, fmt.ts, fmt.teamCount)) return 'team';
  return 'individual';
}

export function getModePointSlotCount(
  mode,
  fmt = getModeFormatMeta(mode),
  scoringMode = getModeScoringMode(mode, fmt),
) {
  if (!fmt) return Array.isArray(mode?.points) ? mode.points.length : 0;
  if (!fmt.team) return fmt.pc;
  return scoringMode === 'team' ? fmt.teamCount : fmt.pc;
}

export function normalizeModePoints(
  mode,
  points = mode?.points,
  fmt = getModeFormatMeta(mode),
  scoringMode = getModeScoringMode(mode, fmt),
) {
  const safePoints = Array.isArray(points) ? points.map((value) => Number(value) || 0) : [];
  if (!fmt) return safePoints;

  if (!fmt.team) return rszPts(safePoints, fmt.pc);

  if (scoringMode === 'team') {
    if (safePoints.length === fmt.teamCount) return rszPts(safePoints, fmt.teamCount);
    if (areTeamPointChunksUniform(safePoints, fmt.ts, fmt.teamCount)) {
      const collapsed = Array.from({ length: fmt.teamCount }, (_, index) => safePoints[index * fmt.ts] || 0);
      return rszPts(collapsed, fmt.teamCount);
    }
    return rszPts(safePoints, fmt.teamCount);
  }

  if (safePoints.length === fmt.teamCount) {
    const expanded = safePoints.flatMap((value) =>
      Array(Math.max(1, Number(fmt.ts) || 1)).fill(Number(value) || 0),
    );
    return rszPts(expanded, fmt.pc);
  }

  return rszPts(safePoints, fmt.pc);
}

export function buildDefaultPointsBySlots(slotCount) {
  const count = Math.max(1, Number(slotCount) || 1);
  const presets = {
    1: [0],
    2: [5, 0],
    3: [5, 3, 0],
    4: [5, 3, 1, 0],
    5: [7, 5, 3, 1, 0],
    6: [9, 7, 5, 3, 1, 0],
    8: [12, 10, 8, 6, 4, 2, 1, 0],
    10: [15, 13, 11, 9, 7, 5, 3, 2, 1, 0],
    12: [18, 16, 14, 12, 10, 8, 6, 4, 3, 2, 1, 0],
    16: [24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 5, 4, 3, 2, 1, 0],
    24: [36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  };

  if (presets[count]) return [...presets[count]];
  return Array.from({ length: count }, (_, index) => Math.max(0, (count - index - 1) * 2));
}

export function buildDefaultPointsForMode(mode) {
  const fmt = getModeFormatMeta(mode) || FMT[mode?.sf];
  const scoringMode = mode?.scoringMode || 'individual';
  const slotCount = fmt?.team && scoringMode === 'team' ? fmt.teamCount : fmt?.pc || 2;
  return buildDefaultPointsBySlots(slotCount);
}
