const DB_NAME = 'mkwc_fs_handles';
const STORE_NAME = 'kv';
const FOLDER_HANDLE_KEY = 'autosave_folder_handle';

export function isSupported() {
  return typeof window !== 'undefined' && !!(window.indexedDB && window.showDirectoryPicker);
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB nicht verfügbar'));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = function onUpgradeNeeded() {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    req.onsuccess = function onSuccess() {
      resolve(req.result);
    };

    req.onerror = function onError() {
      reject(req.error || new Error('DB konnte nicht geöffnet werden'));
    };
  });
}

async function kvGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = function onSuccess() {
      resolve(req.result);
    };
    req.onerror = function onError() {
      reject(req.error || new Error('DB-Lesen fehlgeschlagen'));
    };
  });
}

async function kvSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(value, key);
    req.onsuccess = function onSuccess() {
      resolve(true);
    };
    req.onerror = function onError() {
      reject(req.error || new Error('DB-Schreiben fehlgeschlagen'));
    };
  });
}

async function kvDelete(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(key);
    req.onsuccess = function onSuccess() {
      resolve(true);
    };
    req.onerror = function onError() {
      reject(req.error || new Error('DB-Löschen fehlgeschlagen'));
    };
  });
}

export async function rememberFolderHandle(handle) {
  if (!isSupported() || !handle) {
    return false;
  }
  await kvSet(FOLDER_HANDLE_KEY, handle);
  return true;
}

export async function getRememberedFolderHandle() {
  if (!isSupported()) {
    return null;
  }

  try {
    return await kvGet(FOLDER_HANDLE_KEY);
  } catch {
    return null;
  }
}

export async function forgetFolderHandle() {
  if (!isSupported()) {
    return false;
  }

  try {
    await kvDelete(FOLDER_HANDLE_KEY);
    return true;
  } catch {
    return false;
  }
}

export async function ensureFolderPermission(handle) {
  if (!handle || typeof handle.queryPermission !== 'function') {
    return false;
  }

  try {
    const readWrite = { mode: 'readwrite' };
    if ((await handle.queryPermission(readWrite)) === 'granted') {
      return true;
    }
    return (await handle.requestPermission(readWrite)) === 'granted';
  } catch {
    return false;
  }
}

export async function pickFolderAndRemember(options = {}) {
  if (!isSupported()) {
    throw new Error('Dateiordner-Zugriff wird in diesem Browser nicht unterstützt.');
  }

  const handle = await window.showDirectoryPicker(options);
  await rememberFolderHandle(handle);
  return handle;
}

export async function getActiveFolderHandle() {
  const handle = await getRememberedFolderHandle();
  if (!handle) {
    return null;
  }

  const permitted = await ensureFolderPermission(handle);
  if (!permitted) {
    return null;
  }

  return handle;
}
