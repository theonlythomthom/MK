import { FMT, getModeFormatMeta, getModePointSlotCount, getModeScoringMode, normalizeModePoints } from './modeScoring.js';
import { getCatalogModeAllCups, getCatalogModeRoutes, resolveCatalogMode } from '../catalog/gameCatalog.js';

function runtimeFn(name, fallback) {
  const candidate = globalThis && globalThis[name];
  return typeof candidate === 'function' ? candidate : fallback;
}

function pickRandomFallback(arr) {
  const safe = Array.isArray(arr) ? arr.filter(Boolean) : [];
  return safe.length ? safe[Math.floor(Math.random() * safe.length)] : null;
}

function isKnockoutModeFallback(mode) {
  if (!mode) return false;
  if (mode?.knockout === true) return true;
  const text = `${mode?.id || ''} ${mode?.name || ''} ${mode?.modeId || ''} ${mode?.modeName || ''} ${mode?.catalogModeId || ''}`.toLowerCase();
  return /(^|[^a-z])ko([^a-z]|$)/.test(text)
    || /k\.?-?o\.?/.test(text)
    || /knock\s*out/.test(text)
    || /rally/.test(text);
}

function inferTrackDrawModeFallback(name = '', id = '') {
  const text = `${name} ${id}`.toLowerCase();
  if (isKnockoutModeFallback({ name, id })) return 'route';
  return /(grand prix|\bgp\b|cup|pokal)/.test(text) ? 'cup' : 'track';
}

function normalizeConsolesFallback(cons) {
  return Array.isArray(cons) ? cons : [];
}

function normalizeAttemptCountFallback(value) {
  const parsed = parseInt(value, 10);
  return Math.max(1, Math.min(10, Number.isFinite(parsed) ? parsed : 1));
}

function makeGroupsFallback(ids, size, previousMatches) {
  if (!Array.isArray(ids) || !ids.length) return [];
  const safeSize = Math.max(1, Number(size) || 1);
  const rem = [...ids];
  for (let i = rem.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [rem[i], rem[j]] = [rem[j], rem[i]];
  }
  const groups = [];
  while (rem.length >= safeSize) {
    const group = [rem.shift()];
    for (let k = 1; k < safeSize; k += 1) {
      let bestIndex = 0;
      let bestScore = Number.POSITIVE_INFINITY;
      for (let i = 0; i < rem.length; i += 1) {
        let score = 0;
        for (const existingId of group) {
          const pairKey = [existingId, rem[i]].sort().join('|');
          score += ((previousMatches && previousMatches[pairKey]) || 0) * 1000 + Math.random();
        }
        if (score < bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }
      group.push(rem.splice(bestIndex, 1)[0]);
    }
    groups.push(group);
  }
  rem.forEach((participantId, index) => {
    if (groups[index % groups.length]) groups[index % groups.length].push(participantId);
  });
  return groups;
}

function getSelectionKindForMode(mode) {
  const externalResolver = runtimeFn('getModeSelectionKind');
  if (externalResolver) return externalResolver(mode);
  if (isKnockoutModeFallback(mode)) return 'route';
  const explicit = String(mode?.trackDrawMode || '').toLowerCase();
  if (explicit === 'track' || explicit === 'cup' || explicit === 'route') return explicit;
  const allowed = Array.isArray(mode?.drawModes)
    ? mode.drawModes.map((value) => String(value || '').toLowerCase()).filter(Boolean)
    : [];
  if (allowed.includes('route')) return 'route';
  if (allowed.includes('cup')) return 'cup';
  if (allowed.includes('track')) return 'track';
  return inferTrackDrawModeFallback(mode?.name || mode?.modeName || '', mode?.id || mode?.modeId || '');
}

function pickTrackForMode(consoleId, mode, trackEnabled) {
  const catalogMode = resolveCatalogMode(consoleId, mode);
  const selectionKind = getSelectionKindForMode(catalogMode || mode);
  const knockoutMode = runtimeFn('isKnockoutMode', isKnockoutModeFallback)(catalogMode || mode);
  const cups = knockoutMode ? [] : getCatalogModeAllCups(consoleId, catalogMode || mode);
  const routes = getCatalogModeRoutes(consoleId, catalogMode || mode);

  if (selectionKind === 'route') {
    const routePool = Array.isArray(routes) ? routes.filter((route) => route && route.name) : [];
    return routePool.length ? runtimeFn('pickRandom', pickRandomFallback)(routePool).name : null;
  }

  if (selectionKind === 'cup') {
    const enabledCups = cups.filter((cup) => (cup.tracks || []).some((track) => {
      const sourceKey = `${consoleId}.${cup.__modeId || ((catalogMode && catalogMode.id) || 'grand_prix')}.${cup.id}.${track}`;
      return (trackEnabled || {})[sourceKey] !== false;
    }));
    if (enabledCups.length) return runtimeFn('pickRandom', pickRandomFallback)(enabledCups).name;
    return cups.length ? runtimeFn('pickRandom', pickRandomFallback)(cups).name : null;
  }

  const trackPool = cups.flatMap((cup) => (cup.tracks || []).filter((track) => {
    const sourceKey = `${consoleId}.${cup.__modeId || ((catalogMode && catalogMode.id) || 'grand_prix')}.${cup.id}.${track}`;
    return (trackEnabled || {})[sourceKey] !== false;
  }));
  if (trackPool.length) return runtimeFn('pickRandom', pickRandomFallback)(trackPool);

  const allTracks = cups.flatMap((cup) => cup.tracks || []);
  if (allTracks.length) return runtimeFn('pickRandom', pickRandomFallback)(allTracks);

  const fallbackRoutes = Array.isArray(routes) ? routes.filter((route) => route && route.name) : [];
  return fallbackRoutes.length ? runtimeFn('pickRandom', pickRandomFallback)(fallbackRoutes).name : null;
}

function buildSchedule(fps, cons, trackEnabled) {
  const safeConsoles = runtimeFn('normalizeConsoles', normalizeConsolesFallback)(cons);
  const previousMatches = {};
  const sessions = [];
  const playerIds = (Array.isArray(fps) ? fps : []).map((player) => player.id);

  for (const con of safeConsoles) {
    if (!con?.enabled) continue;
    for (const mode of con.modes || []) {
      if (!mode?.enabled) continue;

      const fmt = FMT[mode.sf] || { pc: 2, team: false, ts: 1, teamCount: Math.max(1, Math.ceil(2 / Math.max(1, 1))) };
      const timeTrial = runtimeFn('isTimeTrialMode', (candidate) => !!candidate?.timeTrial)(mode);
      const attempts = runtimeFn('normalizeAttemptCount', normalizeAttemptCountFallback)(mode?.attempts);
      const scoringMode = getModeScoringMode(mode, fmt);
      const normalizedPoints = normalizeModePoints(mode, mode.points, fmt, scoringMode);
      const pointSlotCount = getModePointSlotCount(mode, fmt, scoringMode);
      const selectionKind = getSelectionKindForMode(mode);

      for (let round = 1; round <= mode.rounds; round += 1) {
        const groups = runtimeFn('makeGroups', makeGroupsFallback)(playerIds, fmt.pc, previousMatches);
        groups.forEach((group) => {
          for (let i = 0; i < group.length; i += 1) {
            for (let j = i + 1; j < group.length; j += 1) {
              const pairKey = [group[i], group[j]].sort().join('|');
              previousMatches[pairKey] = (previousMatches[pairKey] || 0) + 1;
            }
          }
        });

        sessions.push({
          id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          consoleId: con.id,
          consoleName: con.name,
          consoleEmoji: con.emoji,
          modeId: mode.id,
          modeName: mode.name,
          catalogModeId: mode.catalogModeId || mode.modeCatalogId || mode.id,
          round,
          selectionKind,
          groups: groups.map((group, groupIndex) => {
            const trackOrRoute = pickTrackForMode(con.id, mode, trackEnabled);
            return {
              id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${groupIndex}`,
              fps: group,
              refs: [],
              winner: null,
              positions: {},
              tracks: [trackOrRoute],
              track: trackOrRoute,
              timeTrial,
              attempts,
              results: {},
              resultOrder: [],
              notes: '',
              round,
              consoleId: con.id,
              consoleName: con.name,
              consoleEmoji: con.emoji,
              modeId: mode.id,
              modeName: mode.name,
              catalogModeId: mode.catalogModeId || mode.modeCatalogId || mode.id,
              selectionKind,
              teamMode: !!fmt.team,
              teamSize: Math.max(1, Number(fmt.ts || 1) || 1),
              scoringMode,
              pointSlotCount,
              points: normalizedPoints
            };
          })
        });
      }
    }
  }

  return sessions;
}

function normalizeScheduleForConsoles(schedule, cons) {
  const normalizedConsoles = runtimeFn('normalizeConsoles', normalizeConsolesFallback)(cons);
  const consoleMap = new Map(
    normalizedConsoles.map((con) => [
      String(con?.id || ''),
      {
        con,
        modeMap: new Map(((con && con.modes) || []).map((mode) => [String(mode?.id || ''), mode]))
      }
    ])
  );

  let scheduleChanged = false;
  const nextSchedule = (Array.isArray(schedule) ? schedule : []).map((session) => {
    const currentConsoleId = String(session?.consoleId || '');
    const entry = consoleMap.get(currentConsoleId);
    const con = entry?.con || null;
    const modeMap = entry?.modeMap || new Map();
    let sessionChanged = false;

    const nextGroups = ((session?.groups) || []).map((group) => {
      const mode = modeMap.get(String(group?.modeId || session?.modeId || '')) || null;
      const fpsCount = ((group?.fps) || []).length;
      const teamSizeFallback = Math.max(1, Number(group?.teamSize || 1) || 1);
      const fmt = getModeFormatMeta(mode) || getModeFormatMeta(group) || {
        pc: fpsCount,
        team: !!group?.teamMode,
        ts: teamSizeFallback,
        teamCount: Math.max(1, Math.ceil(fpsCount / teamSizeFallback))
      };
      const baseForInference = mode || {
        id: group?.modeId || session?.modeId || '',
        name: group?.modeName || session?.modeName || '',
        modeId: group?.modeId || session?.modeId || '',
        modeName: group?.modeName || session?.modeName || '',
        timeTrial: group?.timeTrial === true
      };
      const inferredTimeTrial = runtimeFn('isTimeTrialMode', (candidate) => !!candidate?.timeTrial)(baseForInference);
      const attempts = runtimeFn('normalizeAttemptCount', normalizeAttemptCountFallback)((mode && mode.attempts) != null ? mode.attempts : group?.attempts);
      const scoringMode = getModeScoringMode(mode || group, fmt);
      const points = normalizeModePoints(mode || group, (mode && mode.points) || group?.points, fmt, scoringMode);
      const pointSlotCount = getModePointSlotCount(mode || group, fmt, scoringMode);
      const selectionKind = getSelectionKindForMode(mode || baseForInference);

      const nextGroup = {
        ...group,
        consoleId: currentConsoleId || group?.consoleId || '',
        consoleName: con?.name || group?.consoleName || session?.consoleName || '',
        consoleEmoji: con?.emoji || group?.consoleEmoji || session?.consoleEmoji || '',
        modeId: mode?.id || group?.modeId || session?.modeId || '',
        modeName: mode?.name || group?.modeName || session?.modeName || '',
        catalogModeId: (mode && (mode.catalogModeId || mode.modeCatalogId || mode.id)) || group?.catalogModeId || session?.catalogModeId || '',
        selectionKind,
        teamMode: !!fmt?.team,
        teamSize: Math.max(1, Number(fmt?.ts || group?.teamSize || 1) || 1),
        scoringMode,
        pointSlotCount,
        points,
        timeTrial: inferredTimeTrial,
        attempts
      };
      const changed = JSON.stringify(nextGroup) !== JSON.stringify(group);
      if (changed) sessionChanged = true;
      return changed ? nextGroup : group;
    });

    const sessionMode = modeMap.get(String(session?.modeId || '')) || null;
    const nextSession = {
      ...session,
      consoleId: currentConsoleId || session?.consoleId || '',
      consoleName: con?.name || session?.consoleName || '',
      consoleEmoji: con?.emoji || session?.consoleEmoji || '',
      modeName: sessionMode?.name || session?.modeName || '',
      catalogModeId: (sessionMode && (sessionMode.catalogModeId || sessionMode.modeCatalogId || sessionMode.id)) || session?.catalogModeId || '',
      selectionKind: getSelectionKindForMode(sessionMode || { modeId: session?.modeId || '', modeName: session?.modeName || '' }),
      groups: nextGroups
    };
    const shellChanged = JSON.stringify({ ...nextSession, groups: undefined }) !== JSON.stringify({ ...session, groups: undefined });
    if (sessionChanged || shellChanged) scheduleChanged = true;
    return (sessionChanged || shellChanged) ? nextSession : session;
  });

  return scheduleChanged ? nextSchedule : schedule;
}

export {
  buildSchedule,
  getSelectionKindForMode,
  normalizeScheduleForConsoles,
  pickTrackForMode
};
