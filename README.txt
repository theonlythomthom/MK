Mario Kart World Cup – Modernisierter Projektstand

Dieser Stand startet nicht mehr über alte React-Vendor-Dateien oder einen manuellen Script-Loader.
Die App läuft jetzt über Vite + npm + ES-Module und enthält zusätzlich einen einfachen Dist-Startweg.

Schnellstart
-----------
Empfohlen für den normalen Start:
1. ZIP komplett entpacken
2. Node.js 20.19+ oder 22.12+ installieren
3. `START_APP.bat` doppelklicken

Was `START_APP.bat` macht:
- nutzt den vorhandenen `dist/`-Build
- erzeugt bei Bedarf zuerst einen frischen Build
- startet danach einen lokalen Server auf `http://127.0.0.1:4173`
- öffnet die App im Browser

Entwicklungsstart
-----------------
Für die Entwicklung:
1. ZIP komplett entpacken
2. `START_DEV.bat` doppelklicken

Oder manuell im Terminal:
- `npm install`
- `npm run dev:open`

Wichtige npm-Befehle
--------------------
- `npm start`        -> startet den gebauten Dist-Stand lokal
- `npm run dev`      -> startet den Vite-Dev-Server
- `npm run dev:open` -> Dev-Server + Browser öffnen
- `npm run build`    -> Produktions-Build
- `npm run preview`  -> Vite-Preview mit Browseröffnung

Aktueller Modernisierungsstand
------------------------------
Erledigt:
- Vite + npm als Standard-Startpfad
- React/ReactDOM aus npm
- ES-Module statt klassischer Raw-Script-Injection
- Legacy-Bootstrap über `src/legacy/bootstrap.js`
- Kernmodule unter `src/` ausgelagert:
  - Katalog
  - Punkte / Modi
  - Spielplan-Domain
  - Ranking-Domain
  - Persistenz
  - Druck / Popup
  - Admin
  - App-Entry
  - Tournament-/Orga-Tabs
  - Core-Runtime
- erste JSX-Migration für Spielplan-Komponenten
- Stabilitäts-Pass:
  - robuster Startpfad
  - Startskripte für Windows
  - Dist-Server ohne zusätzliche Abhängigkeiten
  - MatchCard und Stechen-UI in modernen JSX-Stil überführt
  - Modi-&-Strecken-Tab in JSX modernisiert
  - Speicher-/Backup-Tab in JSX modernisiert

Projektstruktur
---------------
- `index.html`               -> Vite-Entry
- `src/main.jsx`             -> React-Mount
- `src/App.jsx`              -> Bridge-Shell
- `src/legacy/bootstrap.js`  -> Legacy-Bootstrap
- `src/`                     -> modernisierte Modulstruktur
- `js/`                      -> Legacy-Shims / Restkompatibilität
- `styles/`                  -> Styles
- `dist/`                    -> gebauter Startstand
- `scripts/`                 -> Start-/Build-Helfer
- `Speicher/`                -> Daten / Speicherstände

Hinweise
--------
- Der frühere Direktstart per Doppelklick auf `index.html` ist nicht mehr der richtige Weg.
- Bitte die App über `START_APP.bat`, `npm start`, `START_DEV.bat` oder `npm run dev:open` starten.
- Für Windows ist `START_APP.bat` der einfachste Weg.


AKTUELLER STARTWEG
------------------
1. Doppelklick auf index.html:
   -> leitet automatisch auf dist/index.html weiter.
2. Oder START_APP.bat:
   -> startet den lokalen Dist-Server.
3. Für Entwicklung:
   -> START_DEV.bat oder npm run dev
