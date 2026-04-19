import React from 'react';

const { useState, useEffect, useRef } = React;

function usePersist(fps, setFps, cons, setCons, schedule, setSchedule, results, setResults, stechenBlocks, setStechenBlocks, stechenTimes, setStechenTimes, trackEnabled, setTrackEnabled, password, setPassword, playerDb, setPlayerDb, orgaData, setOrgaData) {
    const [filename, setFilename] = useState('mkwc-turnier');
    const [autosave, setAutosave] = useState(true);
    const [autosaveDelay, setAutosaveDelay] = useState(1.0); // Sekunden
    const [fileHandle, setFileHandle] = React.useState(null);
    const [storageDir, setStorageDir] = useState(null);
    const [storageFolderLabel, setStorageFolderLabel] = useState('');
    const [storageStatus, setStorageStatus] = useState('Kein Speicherordner verbunden. Bitte einmal den Ordner "Speicher" im App-Ordner auswählen.');
    const [storageReconnectNeeded, setStorageReconnectNeeded] = useState(false);
    const [storageSupported] = useState(!!(window.MKWCFileStorage && window.MKWCFileStorage.isSupported && window.MKWCFileStorage.isSupported()));
    const [backups, setBackups] = useState([]);
    const [lastManagedSave, setLastManagedSave] = useState(null);
    const latestStateRef = React.useRef('');
    const startupReadyRef = React.useRef(false);
    const skipAutosaveCyclesRef = React.useRef(2);
    const DEFAULT_STORAGE_FOLDER_NAME = 'Speicher';
    const DEFAULT_STORAGE_STATUS = 'Kein Speicherordner verbunden. Bitte einmal den Ordner "Speicher" im App-Ordner auswählen.';

    function serializeState(reason = 'manual') {
        const metaName = (filename || 'mkwc-turnier').trim() || 'mkwc-turnier';
        return JSON.stringify({
            fps,
            cons,
            schedule,
            results,
            stechenBlocks,
            stechenTimes,
            trackEnabled,
            password,
            playerDb,
            orgaData,
            _v: 4,
            _saved: new Date().toISOString(),
            _storage: {
                datasetName: metaName,
                reason
            }
        }, null, 2);
    }

    useEffect(() => {
        latestStateRef.current = serializeState('state-change');
    }, [fps, cons, schedule, results, stechenBlocks, stechenTimes, trackEnabled, password, playerDb, orgaData, filename]);

    function getState() {
        return latestStateRef.current || serializeState('manual');
    }

    function applyLoadedState(d, fileName = '') {
        const nextCons = normalizeConsoles(d.cons || cons);
        const rawSchedule = d.schedule !== undefined ? d.schedule : schedule;
        const nextSchedule = typeof normalizeScheduleForConsoles === 'function'
            ? normalizeScheduleForConsoles(rawSchedule, nextCons)
            : rawSchedule;
        const nextResults = d.results ? (typeof normalizeResultsForSchedule === 'function' ? normalizeResultsForSchedule(nextSchedule, d.results) : d.results) : null;
        if (d.fps)
            setFps(d.fps.map(fp => ({ ...fp, players: (fp.players || []).map((pl, i) => normalizeFpPlayer(pl, i + 1)) })));
        if (d.cons)
            setCons(nextCons);
        if (d.schedule !== undefined)
            setSchedule(nextSchedule);
        if (nextResults)
            setResults(nextResults);
        if (d.stechenBlocks)
            setStechenBlocks(d.stechenBlocks);
        if (d.stechenTimes)
            setStechenTimes(d.stechenTimes);
        if (d.trackEnabled)
            setTrackEnabled(typeof normalizeTrackEnabledMap === 'function' ? normalizeTrackEnabledMap(d.trackEnabled) : d.trackEnabled);
        if (d.password !== undefined)
            setPassword(d.password);
        setPlayerDb(normalizePlayerDb(d.playerDb, nextCons));
        setOrgaData(normalizeOrgaData(d.orgaData));
        const nextName = (d && d._storage && d._storage.datasetName) || fileName.replace(/\.json$/i, '') || filename || 'mkwc-turnier';
        setFilename(nextName);
        skipAutosaveCyclesRef.current = 2;
    }

    function loadState(data) {
        try {
            const d = JSON.parse(data);
            applyLoadedState(d, '');
        }
        catch {
            alert('Fehler beim Laden.');
        }
    }

    async function saveToFile(name) {
        const safeName = (name || filename || 'mkwc-turnier').trim() || 'mkwc-turnier';
        const data = serializeState('export');
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({ suggestedName: safeName + '.json', types: [{ description: 'Turnier-Datei', accept: { 'application/json': ['.json'] } }] });
                setFileHandle(handle);
                const w = await handle.createWritable();
                await w.write(data);
                await w.close();
                setFilename(safeName);
                return true;
            }
            catch (e) {
                if (e && e.name === 'AbortError')
                    return false;
            }
        }
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = safeName + '.json';
        a.click();
        URL.revokeObjectURL(url);
        setFilename(safeName);
        return true;
    }

    async function saveToHandle() {
        if (!fileHandle)
            return false;
        try {
            const w = await fileHandle.createWritable();
            await w.write(serializeState('handle-save'));
            await w.close();
                return true;
        }
        catch {
            return false;
        }
    }

    function loadFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file)
                return;
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const d = JSON.parse(ev.target.result);
                    applyLoadedState(d, file.name);
                }
                catch {
                    alert('Fehler beim Laden der Datei.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    async function refreshBackups(dirOverride) {
        const dir = dirOverride || storageDir;
        if (!dir || !(window.MKWCFileStorage && window.MKWCFileStorage.getSubdir)) {
            setBackups([]);
            return [];
        }
        try {
            const backupDir = await window.MKWCFileStorage.getSubdir(dir, 'backups');
            const files = await window.MKWCFileStorage.listJsonFiles(backupDir);
            const items = files.map(entry => ({ name: entry.name }));
            setBackups(items);
            return items;
        }
        catch {
            setBackups([]);
            return [];
        }
    }

    async function ensureStoragePermission(ask = false, dirOverride) {
        const dir = dirOverride || storageDir;
        if (!dir || !window.MKWCFileStorage)
            return false;
        const ok = await window.MKWCFileStorage.hasReadWritePermission(dir, ask);
        if (!ok) {
            setStorageStatus(ask ? 'Ordnerzugriff wurde nicht freigegeben.' : 'Ordner gemerkt – Zugriff bitte erneut bestätigen.');
            return false;
        }
        return true;
    }

    async function readManagedJson(dir, fileName) {
        try {
            return await window.MKWCFileStorage.readTextFile(dir, fileName);
        }
        catch (e) {
            if (e && e.name === 'NotFoundError')
                return null;
            throw e;
        }
    }

    async function loadManagedCurrent(opts = {}) {
        const dir = opts.dir || storageDir;
        if (!dir)
            return false;
        const ok = await ensureStoragePermission(!!opts.askPermission, dir);
        if (!ok)
            return false;
        try {
            const raw = await readManagedJson(dir, 'current.json');
            if (!raw) {
                if (!opts.silent)
                    setStorageStatus('Im Speicherordner liegt noch keine current.json.');
                return false;
            }
            const data = JSON.parse(raw);
            applyLoadedState(data, 'current');
            setStorageStatus('current.json wurde geladen.');
            return true;
        }
        catch {
            if (!opts.silent)
                alert('current.json konnte nicht geladen werden.');
            setStorageStatus('current.json konnte nicht geladen werden.');
            return false;
        }
    }

    async function loadManagedBackup(fileName, opts = {}) {
        const dir = opts.dir || storageDir;
        if (!dir)
            return false;
        const ok = await ensureStoragePermission(!!opts.askPermission, dir);
        if (!ok)
            return false;
        try {
            const backupDir = await window.MKWCFileStorage.getSubdir(dir, 'backups');
            const raw = await readManagedJson(backupDir, fileName);
            if (!raw)
                return false;
            const data = JSON.parse(raw);
            applyLoadedState(data, fileName);
            setStorageStatus(fileName + ' wurde geladen.');
            return true;
        }
        catch {
            alert('Backup konnte nicht geladen werden.');
            setStorageStatus('Backup konnte nicht geladen werden.');
            return false;
        }
    }


    async function loadLatestManagedBackup(opts = {}) {
        const dir = opts.dir || storageDir;
        if (!dir)
            return false;
        const items = await refreshBackups(dir);
        const latest = items && items.length ? items[0] : null;
        if (!latest) {
            if (!opts.silent)
                setStorageStatus('Im Backup-Ordner wurde noch kein Backup gefunden.');
            return false;
        }
        return loadManagedBackup(latest.name, opts);
    }

    async function pruneBackups(backupDir, limit) {
        const files = await window.MKWCFileStorage.listJsonFiles(backupDir);
        const keep = files.slice(0, limit);
        const remove = files.slice(limit);
        for (const entry of remove) {
            try {
                await window.MKWCFileStorage.deleteFile(backupDir, entry.name);
            }
            catch { }
        }
        return keep.map(entry => ({ name: entry.name }));
    }

    async function managedSaveNow(reason = 'manual', askPermission = false, dirOverride = null) {
        const dir = dirOverride || storageDir;
        if (!dir || !window.MKWCFileStorage)
            return false;
        const ok = await ensureStoragePermission(askPermission, dir);
        if (!ok)
            return false;
        const baseName = window.MKWCFileStorage.safeBaseName(filename || 'mkwc-turnier');
        const data = serializeState(reason);
        try {
            await window.MKWCFileStorage.writeTextFile(dir, 'current.json', data);
            const backupDir = await window.MKWCFileStorage.getSubdir(dir, 'backups');
            const backupName = `${window.MKWCFileStorage.timestampName()}_${baseName}.json`;
            await window.MKWCFileStorage.writeTextFile(backupDir, backupName, data);
            const nextBackups = await pruneBackups(backupDir, 20);
            setBackups(nextBackups);
            const stamp = new Date().toLocaleString();
                setLastManagedSave(stamp);
            setStorageStatus(`Automatisch gespeichert (${reason}).`);
            return true;
        }
        catch (e) {
            setStorageStatus('Speichern im Ordner ist fehlgeschlagen.');
            if (askPermission)
                alert('Speichern im gewählten Ordner ist fehlgeschlagen.');
            return false;
        }
    }

    async function connectStorageFolder(options = {}) {
        if (!(window.MKWCFileStorage && window.MKWCFileStorage.isSupported && window.MKWCFileStorage.isSupported())) {
            alert('Dein Browser unterstützt den gemerkten Speicherordner hier nicht.');
            return false;
        }
        let dir = options.dir || null;
        if (!dir) {
            try {
                dir = await window.showDirectoryPicker({ mode: 'readwrite', id: 'mkwc-storage-folder' });
            }
            catch (e) {
                if (e && e.name !== 'AbortError')
                    alert('Ordner konnte nicht ausgewählt werden.');
                return false;
            }
        }
        const isDefaultFolder = String((dir && dir.name) || '').trim().toLowerCase() === DEFAULT_STORAGE_FOLDER_NAME.toLowerCase();
        setStorageDir(dir);
        setStorageFolderLabel(dir.name || '');
        setStorageReconnectNeeded(false);
        await window.MKWCFileStorage.rememberFolderHandle(dir);
        const hasCurrent = await loadManagedCurrent({ dir, askPermission: true, silent: true });
        if (!hasCurrent) {
            setStorageStatus(isDefaultFolder
                ? 'Standardordner "Speicher" verbunden. current.json wird bei der nächsten Änderung automatisch geschrieben.'
                : 'Ordner verbunden. current.json wird bei der nächsten Änderung automatisch geschrieben.');
            await managedSaveNow('folder-connected', false, dir);
        } else {
            setStorageStatus(isDefaultFolder
                ? 'Standardordner "Speicher" verbunden.'
                : 'Speicherordner verbunden.');
            await refreshBackups(dir);
        }
        return true;
    }

    async function reconnectRememberedFolder(askPermission = false) {
        if (!(window.MKWCFileStorage && window.MKWCFileStorage.getRememberedFolderHandle))
            return false;
        const remembered = await window.MKWCFileStorage.getRememberedFolderHandle();
        if (!remembered) {
            setStorageReconnectNeeded(false);
            setStorageStatus(DEFAULT_STORAGE_STATUS);
            return false;
        }
        setStorageDir(remembered);
        setStorageFolderLabel(remembered.name || '');
        const ok = await ensureStoragePermission(askPermission, remembered);
        if (!ok) {
            setStorageReconnectNeeded(true);
            startupReadyRef.current = true;
            return false;
        }
        const loaded = await loadManagedCurrent({ dir: remembered, askPermission: false, silent: true });
        setStorageReconnectNeeded(false);
        if (!loaded) {
            setStorageStatus('Ordner verbunden. Noch keine current.json vorhanden.');
        }
        await refreshBackups(remembered);
        return true;
    }

    async function clearRememberedFolder() {
        if (window.MKWCFileStorage && window.MKWCFileStorage.forgetFolderHandle)
            await window.MKWCFileStorage.forgetFolderHandle();
        setStorageDir(null);
        setStorageFolderLabel('');
        setStorageReconnectNeeded(false);
        setBackups([]);
        setStorageStatus(DEFAULT_STORAGE_STATUS);
        return true;
    }

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!(window.MKWCFileStorage && window.MKWCFileStorage.isSupported && window.MKWCFileStorage.isSupported())) {
                startupReadyRef.current = true;
                setStorageReconnectNeeded(false);
                setStorageStatus('Direkter Speicherordner wird hier nicht unterstützt.');
                return;
            }
            const remembered = await window.MKWCFileStorage.getRememberedFolderHandle();
            if (cancelled)
                return;
            if (!remembered) {
                startupReadyRef.current = true;
                setStorageReconnectNeeded(false);
                setStorageStatus(DEFAULT_STORAGE_STATUS);
                return;
            }
            setStorageDir(remembered);
            setStorageFolderLabel(remembered.name || '');
            const permitted = await ensureStoragePermission(false, remembered);
            if (!permitted) {
                setStorageReconnectNeeded(true);
                setStorageStatus('Ordner ist gemerkt, aber der Browser verlangt nach dem Neustart noch einen Bestätigungsklick.');
                startupReadyRef.current = true;
                return;
            }
            await loadManagedCurrent({ dir: remembered, askPermission: false, silent: true });
            await refreshBackups(remembered);
            if (!cancelled) {
                setStorageReconnectNeeded(false);
                setStorageStatus('Gemerkter Speicherordner verbunden und current.json geladen.');
                startupReadyRef.current = true;
            }
        })().catch(() => {
            startupReadyRef.current = true;
            setStorageReconnectNeeded(true);
            setStorageStatus('Gemerkter Speicherordner konnte nicht verbunden werden.');
        });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!startupReadyRef.current)
            return;
        if (!autosave)
            return;
        if (!storageDir)
            return;
        if (skipAutosaveCyclesRef.current > 0) {
            skipAutosaveCyclesRef.current -= 1;
            return;
        }
        const delayMs = Math.max(400, Number(autosaveDelay || 1) * 1000);
        const id = setTimeout(() => {
            managedSaveNow('auto-change', false);
        }, delayMs);
        return () => clearTimeout(id);
    }, [fps, cons, schedule, results, stechenBlocks, stechenTimes, trackEnabled, password, playerDb, orgaData, filename, autosave, autosaveDelay, storageDir]);

    return {
        filename,
        setFilename,
        saveToFile,
        saveToHandle,
        loadFromFile,
        autosave,
        setAutosave,
        autosaveDelay,
        setAutosaveDelay,
        fileHandle,
        storageFolderLabel,
        defaultStorageFolderName: DEFAULT_STORAGE_FOLDER_NAME,
        storageStatus,
        storageReconnectNeeded,
        storageSupported,
        chooseStorageFolder: connectStorageFolder,
        reconnectRememberedFolder,
        clearRememberedFolder,
        managedSaveNow,
        loadManagedCurrent,
        loadManagedBackup,
        backups,
        refreshBackups,
        lastManagedSave,
        latestBackupName: (backups && backups[0] && backups[0].name) || '',
        storageConnected: !!storageFolderLabel && !storageReconnectNeeded,
        loadLatestManagedBackup,
        getState,
        loadState
    };
}

export { usePersist };
