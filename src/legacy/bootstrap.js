import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import legacyStylesheetHref from '../../styles/main.css?url';
import { installLegacyBootErrorGuards } from './runtime/boot-error.js';
import * as legacyFileStorage from '../persistence/fileStorage.js';
import * as legacyModeScoring from '../domain/modeScoring.js';
import * as legacyCatalog from '../catalog/gameCatalog.js';
import * as legacyScheduleDomain from '../domain/scheduleDomain.js';

import * as legacyRankingDomain from '../domain/rankingDomain.js';
import * as legacyPrintExport from '../logic/printExport.js';
import * as legacyRankingPopup from '../logic/rankingPopup.js';
import * as legacyPlayerAdmin from '../admin/playerAdmin.js';
import * as legacyPersist from '../state/persistHook.js';
import * as legacyAppMain from '../app/appMain.js';
import * as legacyTournamentTabs from '../ui/tournamentTabs.jsx';
import * as legacyOrgaTabs from '../orga/orgaTabs.js';


let bootPromise = null;

function exposeLegacyGlobals() {
  window.React = React;
  window.ReactDOM = {
    ...ReactDOMClient,
    createRoot: ReactDOMClient.createRoot,
  };
  window.__MKWC_MAIN_STYLESHEET__ = new URL(legacyStylesheetHref, window.location.href).href;
  window.MKWCFileStorage = legacyFileStorage;
  Object.assign(window, legacyModeScoring);
  Object.assign(window, legacyCatalog);
  window.__MKWC_SCHEDULE_DOMAIN__ = legacyScheduleDomain;
  Object.assign(window, legacyScheduleDomain);
  window.__MKWC_RANKING_DOMAIN__ = legacyRankingDomain;
  Object.assign(window, legacyRankingDomain);
  window.__MKWC_PRINT_EXPORT__ = legacyPrintExport;
  Object.assign(window, legacyPrintExport);
  window.__MKWC_RANKING_POPUP__ = legacyRankingPopup;
  Object.assign(window, legacyRankingPopup);
  window.__MKWC_PLAYER_ADMIN__ = legacyPlayerAdmin;
  Object.assign(window, legacyPlayerAdmin);
  window.__MKWC_PERSIST__ = legacyPersist;
  Object.assign(window, legacyPersist);
  window.__MKWC_APP_MAIN__ = legacyAppMain;
  Object.assign(window, legacyAppMain);
  window.__MKWC_TOURNAMENT_TABS__ = legacyTournamentTabs;
  Object.assign(window, legacyTournamentTabs);
  window.__MKWC_ORGA_TABS__ = legacyOrgaTabs;
  Object.assign(window, legacyOrgaTabs);
  window.__MKWC_RUNTIME__ = {
    mode: 'vite-legacy-bridge',
    startedAt: new Date().toISOString(),
  };
}


export function bootstrapLegacyApp() {
  if (window.__MKWC_LEGACY_BOOTSTRAPPED__) {
    return Promise.resolve();
  }

  if (bootPromise) {
    return bootPromise;
  }

  bootPromise = (async () => {
    installLegacyBootErrorGuards({ rootId: 'root' });

    const rootNode = document.getElementById('root');

    if (!rootNode) {
      throw new Error('Legacy-Root #root fehlt.');
    }

    exposeLegacyGlobals();

    const legacyCoreRuntime = await import('../core/coreRuntime.js');
    window.__MKWC_CORE_RUNTIME__ = legacyCoreRuntime;
    Object.assign(window, legacyCoreRuntime);

    legacyAppMain.startLegacyApp();

    window.__MKWC_LEGACY_BOOTSTRAPPED__ = true;
  })().catch((error) => {
    bootPromise = null;
    throw error;
  });

  return bootPromise;
}
