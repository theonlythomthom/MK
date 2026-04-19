import { stechenPts as importedStechenPts, getModeScoringMode as importedGetModeScoringMode } from './modeScoring.js';

const stechenPts = importedStechenPts;
const getModeScoringMode = importedGetModeScoringMode;

function normalizeAttemptCount(value) {
  if (typeof globalThis.normalizeAttemptCount === 'function') return globalThis.normalizeAttemptCount(value);
  return Math.max(1, Math.min(10, parseInt(value, 10) || 1));
}
function normalizeTimeFieldEntry(entry) {
  if (typeof globalThis.normalizeTimeFieldEntry === 'function') return globalThis.normalizeTimeFieldEntry(entry);
  return {
    mm: String((entry?.mm) || '').replace(/[^0-9]/g, '').slice(0, 2),
    ss: String((entry?.ss) || '').replace(/[^0-9]/g, '').slice(0, 2),
    ms: String((entry?.ms) || '').replace(/[^0-9]/g, '').slice(0, 3),
  };
}
function isTimeFieldEntryComplete(entry) {
  if (typeof globalThis.isTimeFieldEntryComplete === 'function') return globalThis.isTimeFieldEntryComplete(entry);
  const tv = normalizeTimeFieldEntry(entry);
  return tv.mm.length >= 1 && tv.ss.length >= 1 && tv.ms.length >= 1;
}
function parseTimeFieldEntry(entry) {
  if (typeof globalThis.parseTimeFieldEntry === 'function') return globalThis.parseTimeFieldEntry(entry);
  const tv = normalizeTimeFieldEntry(entry);
  if (!isTimeFieldEntryComplete(tv)) return null;
  const mm = parseInt(tv.mm, 10) || 0;
  const ss = parseInt(tv.ss, 10) || 0;
  const ms = parseInt(tv.ms, 10) || 0;
  return (mm * 60) + ss + (ms / 1000);
}
function isTimeTrialMode(group) {
  if (typeof globalThis.isTimeTrialMode === 'function') return globalThis.isTimeTrialMode(group);
  return false;
}
function areTeamPointChunksUniform(points, teamSize, teamCount) {
  if (typeof globalThis.areTeamPointChunksUniform === 'function') return globalThis.areTeamPointChunksUniform(points, teamSize, teamCount);
  const safeTeamSize = Math.max(1, Number(teamSize) || 1);
  const safeTeamCount = Math.max(0, Number(teamCount) || 0);
  const pointList = Array.isArray(points) ? points.map(v => Number(v) || 0) : [];
  if (!pointList.length || !safeTeamCount) return false;
  if (pointList.length < safeTeamSize * safeTeamCount) return false;
  for (let teamIndex = 0; teamIndex < safeTeamCount; teamIndex += 1) {
    const start = teamIndex * safeTeamSize;
    const chunk = pointList.slice(start, start + safeTeamSize);
    if (chunk.length !== safeTeamSize) return false;
    if (!chunk.every(value => value === chunk[0])) return false;
  }
  return true;
}
function parseStechenTimeObj(value) {
  if (typeof globalThis.parseStechenTimeObj === 'function') return globalThis.parseStechenTimeObj(value);
  return null;
}
function fpName(fp) {
  if (typeof globalThis.fpName === 'function') return globalThis.fpName(fp);
  const first = String(fp?.firstName || '').trim();
  const last = String(fp?.lastName || '').trim();
  const nick = String(fp?.nickname || '').trim();
  return [first, last].filter(Boolean).join(' ') || nick || '?';
}
function fpSub(fp) {
  if (typeof globalThis.fpSub === 'function') return globalThis.fpSub(fp);
  return String(fp?.nickname || '').trim();
}
function isSolo(fp) {
  if (typeof globalThis.isSolo === 'function') return globalThis.isSolo(fp);
  return !String(fp?.teamName || '').trim();
}

function getGroupParticipantCount(group) {
    return (((group && group.fps) || []).length) || 0;
}
function getGroupTeamCount(group) {
    const fpsCount = getGroupParticipantCount(group);
    const teamSize = Math.max(1, Number((group && group.teamSize) || 1) || 1);
    return Math.max(0, Math.ceil(fpsCount / teamSize));
}
function normalizePlacementNumber(value) {
    const rank = parseInt(value, 10);
    return Number.isFinite(rank) && rank > 0 ? rank : null;
}
function isGroupTimeTrial(group) {
    if ((group === null || group === void 0 ? void 0 : group.timeTrial) === true)
        return true;
    if (typeof isTimeTrialMode === 'function')
        return !!isTimeTrialMode(group);
    const text = `${(group === null || group === void 0 ? void 0 : group.id) || ''} ${(group === null || group === void 0 ? void 0 : group.name) || ''} ${(group === null || group === void 0 ? void 0 : group.modeId) || ''} ${(group === null || group === void 0 ? void 0 : group.modeName) || ''}`.toLowerCase();
    return /zeitfahr/.test(text) || /zeitrenn/.test(text) || /time\s*trial/.test(text) || /(?:^|_)time(?:$|_)/.test(text);
}
function getGroupAttemptCount(group) {
    if (typeof normalizeAttemptCount === 'function')
        return normalizeAttemptCount(group === null || group === void 0 ? void 0 : group.attempts);
    return Math.max(1, Math.min(10, parseInt(group === null || group === void 0 ? void 0 : group.attempts, 10) || 1));
}
function normalizeTimeTrialFieldEntryLocal(entry) {
    if (typeof normalizeTimeFieldEntry === 'function')
        return normalizeTimeFieldEntry(entry);
    return {
        mm: String((entry === null || entry === void 0 ? void 0 : entry.mm) || '').replace(/[^0-9]/g, '').slice(0, 2),
        ss: String((entry === null || entry === void 0 ? void 0 : entry.ss) || '').replace(/[^0-9]/g, '').slice(0, 2),
        ms: String((entry === null || entry === void 0 ? void 0 : entry.ms) || '').replace(/[^0-9]/g, '').slice(0, 3),
    };
}
function isTimeTrialFieldEntryCompleteLocal(entry) {
    if (typeof isTimeFieldEntryComplete === 'function')
        return isTimeFieldEntryComplete(entry);
    const tv = normalizeTimeTrialFieldEntryLocal(entry);
    return tv.mm.length >= 1 && tv.ss.length >= 1 && tv.ms.length >= 1;
}
function parseTimeTrialFieldEntryLocal(entry) {
    if (typeof parseTimeFieldEntry === 'function')
        return parseTimeFieldEntry(entry);
    const tv = normalizeTimeTrialFieldEntryLocal(entry);
    if (!isTimeTrialFieldEntryCompleteLocal(tv))
        return null;
    const mm = parseInt(tv.mm, 10);
    const ss = parseInt(tv.ss, 10);
    if (!Number.isFinite(mm) || !Number.isFinite(ss))
        return null;
    const msFrac = Number(`0.${tv.ms}`);
    if (!Number.isFinite(msFrac))
        return null;
    return mm * 60 + ss + msFrac;
}
function normalizeTimeTrialEntriesForResult(group, result) {
    const normalized = {};
    const ids = ((group && group.fps) || []);
    const attemptCount = getGroupAttemptCount(group);
    const source = (((result === null || result === void 0 ? void 0 : result.timeTrials) || {}));
    ids.forEach(fid => {
        const rawList = Array.isArray(source[fid]) ? source[fid] : [];
        normalized[fid] = Array.from({ length: attemptCount }, (_, index) => normalizeTimeTrialFieldEntryLocal(rawList[index]));
    });
    return normalized;
}
function getTimeTrialBestTimeFromAttempts(entries) {
    const parsed = (entries || []).map(entry => parseTimeTrialFieldEntryLocal(entry)).filter(value => value != null);
    if (!parsed.length)
        return null;
    return Math.min(...parsed);
}
function normalizeSoloPlacementsForResult(group, result) {
    const normalized = {};
    const ids = ((group && group.fps) || []);
    const placements = (((result === null || result === void 0 ? void 0 : result.placements) || {}));
    ids.forEach(fid => {
        const rank = normalizePlacementNumber(placements[fid]);
        if (rank != null)
            normalized[fid] = rank;
    });
    return normalized;
}
function normalizeTeamPlacementsForResult(group, result) {
    const placements = {};
    const teamCount = getGroupTeamCount(group);
    const source = (((result === null || result === void 0 ? void 0 : result.teamPlacements) || {}));
    for (let i = 0; i < teamCount; i++) {
        const rank = normalizePlacementNumber(source[i]);
        if (rank != null)
            placements[i] = rank;
    }
    const hasPlacements = Object.keys(placements).some(key => placements[key] != null);
    if (!hasPlacements && result && result.winningTeam != null) {
        const winnerIdx = parseInt(result.winningTeam, 10);
        if (Number.isFinite(winnerIdx) && winnerIdx >= 0 && winnerIdx < teamCount) {
            placements[winnerIdx] = 1;
            let nextRank = 2;
            for (let i = 0; i < teamCount; i++) {
                if (i === winnerIdx)
                    continue;
                if (placements[i] == null) {
                    placements[i] = nextRank++;
                }
            }
        }
    }
    return placements;
}
function areTeamPointChunksUniformLocal(points, teamSize, teamCount) {
    if (typeof areTeamPointChunksUniform === 'function')
        return areTeamPointChunksUniform(points, teamSize, teamCount);
    const safePoints = Array.isArray(points) ? points.map(v => Number(v) || 0) : [];
    const safeTeamSize = Math.max(1, Number(teamSize) || 1);
    const safeTeamCount = Math.max(1, Number(teamCount) || 1);
    if (safePoints.length !== safeTeamSize * safeTeamCount)
        return false;
    for (let i = 0; i < safeTeamCount; i++) {
        const start = i * safeTeamSize;
        const chunk = safePoints.slice(start, start + safeTeamSize);
        if (chunk.length !== safeTeamSize)
            return false;
        if (!chunk.every(value => value === chunk[0]))
            return false;
    }
    return true;
}
function getGroupScoringModeLocal(group) {
    if (!(group === null || group === void 0 ? void 0 : group.teamMode))
        return 'individual';
    if (typeof getModeScoringMode === 'function')
        return getModeScoringMode(group, { team: true, ts: Math.max(1, Number(group.teamSize) || 1), pc: getGroupParticipantCount(group), teamCount: getGroupTeamCount(group) });
    const raw = String((group === null || group === void 0 ? void 0 : group.scoringMode) || (group === null || group === void 0 ? void 0 : group.teamScoring) || '').toLowerCase();
    if (raw === 'team' || raw === 'individual')
        return raw;
    const points = Array.isArray(group === null || group === void 0 ? void 0 : group.points) ? group.points.map(v => Number(v) || 0) : [];
    const teamCount = getGroupTeamCount(group);
    if (points.length === teamCount)
        return 'team';
    if (areTeamPointChunksUniformLocal(points, Math.max(1, Number(group === null || group === void 0 ? void 0 : group.teamSize) || 1), teamCount))
        return 'team';
    return 'individual';
}
function getExpectedPointSlotCount(group) {
    if (!group)
        return 0;
    if (group.teamMode) {
        return getGroupScoringModeLocal(group) === 'team' ? getGroupTeamCount(group) : getGroupParticipantCount(group);
    }
    return getGroupParticipantCount(group);
}
function getSharedTeamPlacementPoints(points, placement, teamSize) {
    const rank = normalizePlacementNumber(placement);
    if (rank == null)
        return 0;
    const safeSize = Math.max(1, Number(teamSize) || 1);
    const pointList = Array.isArray(points) ? points : [];
    const start = (rank - 1) * safeSize;
    const slice = pointList.slice(start, start + safeSize).map(v => Number(v) || 0);
    if (!slice.length)
        return 0;
    const allEqual = slice.every(v => v === slice[0]);
    if (allEqual)
        return slice[0];
    const total = slice.reduce((sum, value) => sum + value, 0);
    return total / slice.length;
}
function getGroupPointListForScoringLocal(group) {
    const pointList = Array.isArray(group === null || group === void 0 ? void 0 : group.points) ? group.points.map(v => Number(v) || 0) : [];
    if (getGroupScoringModeLocal(group) !== 'team')
        return pointList;
    const teamCount = getGroupTeamCount(group);
    const teamSize = Math.max(1, Number(group === null || group === void 0 ? void 0 : group.teamSize) || 1);
    if (pointList.length === teamCount)
        return pointList;
    if (areTeamPointChunksUniformLocal(pointList, teamSize, teamCount)) {
        return Array.from({ length: teamCount }, (_, i) => pointList[i * teamSize] || 0);
    }
    return pointList.slice(0, teamCount);
}
function getAwardedTeamPlacementPoints(group, placement) {
    const rank = normalizePlacementNumber(placement);
    if (rank == null)
        return 0;
    const pointList = getGroupPointListForScoringLocal(group);
    if (getGroupScoringModeLocal(group) === 'team')
        return Number((pointList[rank - 1]) || 0);
    return getSharedTeamPlacementPoints(pointList, rank, Math.max(1, Number(group === null || group === void 0 ? void 0 : group.teamSize) || 1));
}
function getGroupScoringAudit(group, result) {
    const audit = {
        groupId: (group && group.id) || '',
        teamMode: !!(group && group.teamMode),
        timeTrial: isGroupTimeTrial(group),
        hasResult: !!result,
        hasAnyPlacement: false,
        isComplete: false,
        isValid: true,
        isScorable: false,
        participantCount: getGroupParticipantCount(group),
        teamCount: getGroupTeamCount(group),
        teamSize: Math.max(1, Number((group && group.teamSize) || 1) || 1),
        attemptCount: getGroupAttemptCount(group),
        normalizedPlacements: {},
        awarded: {},
        bestTimes: {},
        timeTrials: {},
        issues: [],
        warnings: []
    };
    if (!group || !result)
        return audit;
    const pointList = Array.isArray(group.points) ? group.points : [];
    const expectedPointSlots = getExpectedPointSlotCount(group);
    if (!pointList.length) {
        audit.warnings.push('Für dieses Match sind keine Punkte definiert.');
    }
    else if (pointList.length < expectedPointSlots) {
        audit.warnings.push(`Das Punkteschema hat nur ${pointList.length} statt ${expectedPointSlots} Einträge. Fehlende Plätze werden mit 0 Punkten gewertet.`);
    }
    if (audit.timeTrial && !audit.teamMode) {
        const ids = ((group && group.fps) || []);
        const legacyPlacements = normalizeSoloPlacementsForResult(group, result);
        const hasLegacyPlacements = Object.keys(legacyPlacements).length > 0;
        const hasTimeTrialEntries = !!Object.keys((((result === null || result === void 0 ? void 0 : result.timeTrials) || {}))).length;
        if (!hasTimeTrialEntries && hasLegacyPlacements) {
            audit.normalizedPlacements = legacyPlacements;
            const values = [];
            ids.forEach(fid => {
                const rank = legacyPlacements[fid];
                if (rank != null) {
                    audit.hasAnyPlacement = true;
                    values.push(rank);
                    if (rank > ids.length) {
                        audit.isValid = false;
                        audit.issues.push(`Fahrerplatz ${fid} hat die ungültige Platzierung ${rank}.`);
                    }
                }
            });
            if (values.length === ids.length)
                audit.isComplete = true;
            if (values.length && new Set(values).size !== values.length) {
                audit.isValid = false;
                audit.issues.push('Mindestens zwei Fahrerplätze teilen sich dieselbe Platzierung.');
            }
            if (audit.isComplete && audit.isValid) {
                ids.forEach(fid => {
                    const rank = legacyPlacements[fid];
                    if (rank == null)
                        return;
                    audit.awarded[fid] = Number((pointList[rank - 1]) || 0);
                });
            }
            audit.warnings.push('Legacy-Zeitfahren ohne gespeicherte Zeiten wurde über die vorhandenen Platzierungen gewertet.');
            audit.isScorable = audit.isComplete && audit.isValid;
            return audit;
        }
        const entriesByFp = normalizeTimeTrialEntriesForResult(group, result);
        audit.timeTrials = entriesByFp;
        const missingPlayers = [];
        const bestTimes = [];
        ids.forEach(fid => {
            const entries = entriesByFp[fid] || [];
            const completeEntries = entries.filter(entry => isTimeTrialFieldEntryCompleteLocal(entry));
            if (completeEntries.length > 0) {
                audit.hasAnyPlacement = true;
                const best = getTimeTrialBestTimeFromAttempts(completeEntries);
                if (best != null) {
                    audit.bestTimes[fid] = best;
                    bestTimes.push([fid, best]);
                }
            }
            else {
                missingPlayers.push(fid);
            }
        });
        audit.isComplete = ids.length > 0 && bestTimes.length === ids.length;
        if (missingPlayers.length > 0) {
            audit.warnings.push('Fahrerplätze ohne eingetragene Zeit bleiben vorerst aus der Live-Wertung.');
        }
        const seenTimes = new Map();
        bestTimes.forEach(([fid, best]) => {
            const key = best.toFixed(3);
            if (!seenTimes.has(key))
                seenTimes.set(key, []);
            seenTimes.get(key).push(fid);
        });
        seenTimes.forEach((fids, key) => {
            if (fids.length > 1) {
                audit.isValid = false;
                audit.issues.push(`Mindestens zwei Fahrerplätze haben dieselbe Bestzeit (${key.replace('.', ',')} s).`);
            }
        });
        if (bestTimes.length > 0 && audit.isValid) {
            bestTimes.sort((a, b) => a[1] - b[1]);
            bestTimes.forEach(([fid], index) => {
                const rank = index + 1;
                audit.normalizedPlacements[fid] = rank;
                audit.awarded[fid] = Number((pointList[rank - 1]) || 0);
            });
        }
        audit.isScorable = bestTimes.length > 0 && audit.isValid;
        return audit;
    }
    if (group.teamMode) {
        const placements = normalizeTeamPlacementsForResult(group, result);
        audit.normalizedPlacements = placements;
        const values = [];
        for (let i = 0; i < audit.teamCount; i++) {
            const rank = placements[i];
            if (rank != null) {
                audit.hasAnyPlacement = true;
                values.push(rank);
                if (rank > audit.teamCount) {
                    audit.isValid = false;
                    audit.issues.push(`Team ${i + 1} hat die ungültige Platzierung ${rank}.`);
                }
            }
        }
        if (values.length === audit.teamCount)
            audit.isComplete = true;
        if (values.length && new Set(values).size !== values.length) {
            audit.isValid = false;
            audit.issues.push('Mindestens zwei Teams teilen sich dieselbe Platzierung.');
        }
        if (audit.isComplete && audit.isValid) {
            ((group && group.fps) || []).forEach((fid, index) => {
                const teamIndex = Math.floor(index / audit.teamSize);
                const placement = placements[teamIndex];
                if (placement == null)
                    return;
                audit.awarded[fid] = getAwardedTeamPlacementPoints(group, placement);
            });
        }
    }
    else {
        const placements = normalizeSoloPlacementsForResult(group, result);
        audit.normalizedPlacements = placements;
        const ids = ((group && group.fps) || []);
        const values = [];
        ids.forEach(fid => {
            const rank = placements[fid];
            if (rank != null) {
                audit.hasAnyPlacement = true;
                values.push(rank);
                if (rank > ids.length) {
                    audit.isValid = false;
                    audit.issues.push(`Fahrerplatz ${fid} hat die ungültige Platzierung ${rank}.`);
                }
            }
        });
        if (values.length === ids.length)
            audit.isComplete = true;
        if (values.length && new Set(values).size !== values.length) {
            audit.isValid = false;
            audit.issues.push('Mindestens zwei Fahrerplätze teilen sich dieselbe Platzierung.');
        }
        if (audit.isComplete && audit.isValid) {
            ids.forEach(fid => {
                const rank = placements[fid];
                if (rank == null)
                    return;
                audit.awarded[fid] = Number((pointList[rank - 1]) || 0);
            });
        }
    }
    audit.isScorable = audit.isComplete && audit.isValid;
    return audit;
}
function getScoredGroupPoints(group, result) {
    return getGroupScoringAudit(group, result).awarded;
}
function isScoredGroupResultComplete(group, result) {
    return getGroupScoringAudit(group, result).isScorable;
}
function normalizeGroupResultForSchedule(group, result) {
    if (!group || !result)
        return result;
    const next = { ...(result || {}) };
    if (isGroupTimeTrial(group) && !group.teamMode) {
        next.timeTrials = normalizeTimeTrialEntriesForResult(group, result);
        return next;
    }
    if (group.teamMode) {
        next.teamPlacements = normalizeTeamPlacementsForResult(group, result);
    }
    else {
        next.placements = normalizeSoloPlacementsForResult(group, result);
    }
    return next;
}
function normalizeResultsForSchedule(schedule, results) {
    const src = (results && typeof results === 'object') ? results : {};
    if (!schedule)
        return { ...src };
    const normalized = { ...src };
    (schedule || []).forEach(sess => {
        (sess.groups || []).forEach(group => {
            if (!src[group.id])
                return;
            normalized[group.id] = normalizeGroupResultForSchedule(group, src[group.id]);
        });
    });
    return normalized;
}

function normalizeFpIdKey(value) {
    if (value == null)
        return '';
    return String(value);
}
function parseStechenSoloEntryKey(key) {
    if (typeof key !== 'string' || !key.startsWith('s'))
        return '';
    return normalizeFpIdKey(key.slice(1));
}

function summarizeRankingAudit(fps, schedule, results) {
    const summary = {
        totalGroups: 0,
        scoredGroups: 0,
        partialGroups: 0,
        invalidGroups: 0,
        issues: [],
        warnings: [],
        groups: {}
    };
    if (!schedule)
        return summary;
    (schedule || []).forEach(sess => {
        (sess.groups || []).forEach(group => {
            summary.totalGroups++;
            const audit = getGroupScoringAudit(group, results && results[group.id]);
            summary.groups[group.id] = audit;
            if (audit.isScorable)
                summary.scoredGroups++;
            else if (audit.hasAnyPlacement)
                summary.partialGroups++;
            if (!audit.isValid)
                summary.invalidGroups++;
            audit.issues.forEach(message => summary.issues.push({
                level: 'error',
                consoleId: sess.consoleId,
                consoleName: sess.consoleName,
                groupId: group.id,
                message
            }));
            audit.warnings.forEach(message => summary.warnings.push({
                level: 'warning',
                consoleId: sess.consoleId,
                consoleName: sess.consoleName,
                groupId: group.id,
                message
            }));
        });
    });
    return summary;
}
function computeRankingCore(fps, schedule, results, stechenBlocks = [], stechenTimes = {}) {
    const safeFps = fps || [];
    const safeSchedule = schedule || [];
    const normalizedResults = normalizeResultsForSchedule(safeSchedule, results);
    const auditSummary = summarizeRankingAudit(safeFps, safeSchedule, normalizedResults);
    const allTeams = [...new Set(safeFps.map(f => f.teamName).filter(Boolean))];
    const activeCons = safeSchedule ? [...new Set(safeSchedule.map(s => s.consoleId))] : [];
    function stechenBonus(block) {
        const bt = stechenTimes[block.id] || {};
        const withT = (block.entries || []).map(e => ({ key: e.key, t: parseStechenTimeObj(bt[e.key]) })).filter(e => e.t !== null);
        if (withT.length < (block.entries || []).length)
            return {};
        const sorted = [...withT].sort((a, b) => a.t - b.t);
        const bonus = {};
        sorted.forEach((e, i) => { bonus[e.key] = stechenPts(i + 1); });
        return bonus;
    }
    const fpById = Object.fromEntries(safeFps.map(f => [f.id, f]));
    const fpBase = Object.fromEntries(safeFps.map(f => [f.id, 0]));
    const tpBase = Object.fromEntries(allTeams.map(t => [t, 0]));
    const cpBase = Object.fromEntries(activeCons.map(cid => [cid, {}]));
    safeSchedule.forEach(sess => {
        (sess.groups || []).forEach(group => {
            const audit = (auditSummary.groups || {})[group.id] || getGroupScoringAudit(group, normalizedResults[group.id]);
            const groupPoints = audit.awarded || {};
            if (!Object.keys(groupPoints).length)
                return;
            if (!cpBase[sess.consoleId])
                cpBase[sess.consoleId] = {};
            Object.entries(groupPoints).forEach(([fidRaw, ptsRaw]) => {
                const fid = normalizeFpIdKey(fidRaw);
                const pts = Number(ptsRaw) || 0;
                fpBase[fid] = (fpBase[fid] || 0) + pts;
                const fp = fpById[fid];
                if (fp && fp.teamName)
                    tpBase[fp.teamName] = (tpBase[fp.teamName] || 0) + pts;
                cpBase[sess.consoleId][fid] = (cpBase[sess.consoleId][fid] || 0) + pts;
            });
        });
    });
    const sb_gesamt = {}, sb_solo = {}, sb_team = {}, sb_con = {};
    (stechenBlocks || []).forEach(block => {
        const bonus = stechenBonus(block);
        if (!Object.keys(bonus).length)
            return;
        const isConsole = block.id.startsWith('con_');
        const cid = isConsole ? block.id.split('_')[1] : null;
        Object.entries(bonus).forEach(([key, pts]) => {
            if (isConsole && cid) {
                if (!sb_con[cid])
                    sb_con[cid] = {};
                const fid = parseStechenSoloEntryKey(key);
                if (fid)
                    sb_con[cid][fid] = (sb_con[cid][fid] || 0) + pts;
            }
            else if (block.id.startsWith('gesamt_')) {
                if (key.startsWith('s')) {
                    const fid = parseStechenSoloEntryKey(key);
                    if (fid)
                        sb_gesamt[fid] = (sb_gesamt[fid] || 0) + pts;
                }
                else if (key.startsWith('t')) {
                    const tn = key.slice(1);
                    sb_gesamt['t_' + tn] = (sb_gesamt['t_' + tn] || 0) + pts;
                }
            }
            else if (block.id.startsWith('solo_')) {
                if (key.startsWith('s')) {
                    const fid = parseStechenSoloEntryKey(key);
                    if (fid)
                        sb_solo[fid] = (sb_solo[fid] || 0) + pts;
                }
            }
            else if (block.id.startsWith('team_')) {
                if (key.startsWith('t')) {
                    const tn = key.slice(1);
                    sb_team[tn] = (sb_team[tn] || 0) + pts;
                }
            }
        });
    });
    const fpPts_gesamt = Object.fromEntries(safeFps.map(f => [f.id, (fpBase[f.id] || 0) + (sb_gesamt[f.id] || 0)]));
    const teamPts_gesamt = Object.fromEntries(allTeams.map(t => [t, (tpBase[t] || 0) + (sb_gesamt['t_' + t] || 0)]));
    const fpPts_solo = Object.fromEntries(safeFps.map(f => [f.id, (fpBase[f.id] || 0) + (sb_solo[f.id] || 0)]));
    const teamPts_team = Object.fromEntries(allTeams.map(t => [t, (tpBase[t] || 0) + (sb_team[t] || 0)]));
    const conPts = {};
    activeCons.forEach(cid => {
        conPts[cid] = {};
        safeFps.forEach(f => {
            var _a, _b;
            conPts[cid][f.id] = (((_a = cpBase[cid]) === null || _a === void 0 ? void 0 : _a[f.id]) || 0) + (((_b = sb_con[cid]) === null || _b === void 0 ? void 0 : _b[f.id]) || 0);
        });
    });
    const conStats = {};
    safeFps.forEach(f => { conStats[f.id] = {}; });
    safeSchedule.forEach(sess => {
        const cid = sess.consoleId;
        (sess.groups || []).forEach(group => {
            const audit = (auditSummary.groups || {})[group.id] || getGroupScoringAudit(group, normalizedResults[group.id]);
            (group.fps || []).forEach(fid => {
                if (!conStats[fid])
                    conStats[fid] = {};
                if (!conStats[fid][cid])
                    conStats[fid][cid] = { done: 0, total: 0 };
                conStats[fid][cid].total++;
                if (audit.isScorable && (audit.awarded || {})[fid] != null)
                    conStats[fid][cid].done++;
            });
        });
    });
    const consoleOrder = safeSchedule ? [...new Set(safeSchedule.map(s => s.consoleId))] : [];
    const gesamtEntries = [
        ...safeFps.filter(isSolo).map(f => ({ type: 'solo', key: `s${f.id}`, name: fpName(f), sub: fpSub(f), pts: fpPts_gesamt[f.id] || 0, fp: f })),
        ...allTeams.map(t => ({ type: 'team', key: `t${t}`, name: t, sub: safeFps.filter(f => f.teamName === t).map(f => f.players.map(p => p.nickname ? `${p.name} "${p.nickname}"` : p.name).join(' & ')).join(' · '), pts: teamPts_gesamt[t] || 0 }))
    ].sort((a, b) => b.pts - a.pts).map((e, i) => ({ ...e, rank: i + 1 }));
    const soloRank = safeFps.filter(isSolo).map(f => ({ ...f, pts: fpPts_solo[f.id] || 0, fp: f })).sort((a, b) => b.pts - a.pts).map((f, i) => ({ ...f, rank: i + 1 }));
    const teamRank = allTeams.map(t => ({ t, pts: teamPts_team[t] || 0, members: safeFps.filter(f => f.teamName === t) })).sort((a, b) => b.pts - a.pts).map((x, i) => ({ ...x, rank: i + 1 }));
    const teamConPts = {};
    activeCons.forEach(cid => {
        teamConPts[cid] = {};
        allTeams.forEach(t => {
            teamConPts[cid][t] = safeFps.filter(f => f.teamName === t).reduce((sum, f) => sum + ((conPts[cid] || {})[f.id] || 0), 0);
        });
    });
    const conRankings = activeCons.map(cid => {
        const sess = safeSchedule.find(s => s.consoleId === cid);
        if (!sess)
            return null;
        const rank = safeFps.map(f => ({ f, pts: (conPts[cid] || {})[f.id] || 0 })).sort((a, b) => b.pts - a.pts).map((x, i) => ({ ...x, rank: i + 1 }));
        return { cid, emoji: sess.consoleEmoji, name: sess.consoleName, rank };
    }).filter(Boolean);
    return { allTeams, conStats, consoleOrder, gesamtEntries, soloRank, teamRank, conRankings, conPts, teamConPts, auditSummary, normalizedResults };
}


export {
  getGroupParticipantCount,
  getGroupTeamCount,
  normalizePlacementNumber,
  isGroupTimeTrial,
  getGroupAttemptCount,
  normalizeTimeTrialFieldEntryLocal,
  isTimeTrialFieldEntryCompleteLocal,
  parseTimeTrialFieldEntryLocal,
  normalizeTimeTrialEntriesForResult,
  getTimeTrialBestTimeFromAttempts,
  normalizeSoloPlacementsForResult,
  normalizeTeamPlacementsForResult,
  areTeamPointChunksUniformLocal,
  getGroupScoringModeLocal,
  getExpectedPointSlotCount,
  getSharedTeamPlacementPoints,
  getGroupPointListForScoringLocal,
  getAwardedTeamPlacementPoints,
  getGroupScoringAudit,
  getScoredGroupPoints,
  isScoredGroupResultComplete,
  normalizeGroupResultForSchedule,
  normalizeResultsForSchedule,
  normalizeFpIdKey,
  parseStechenSoloEntryKey,
  summarizeRankingAudit,
  computeRankingCore
};
