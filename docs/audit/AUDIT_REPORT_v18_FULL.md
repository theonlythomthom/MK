# Vollaudit v18 – Konsistenz, Offline-Start, Popup-State und Codebereinigung

## Prüfumfang
Geprüft wurden der aktive App-Pfad und die Release-Struktur:

- `index.html`
- `styles/main.css`
- `js/core.js`
- `js/app-main.js`
- `js/state/persist.js`
- `js/logic/ranking-popup.js`
- `tests/`
- Release-Struktur inkl. Altlasten/Legacy

## Wichtige Befunde
1. **Start-Architektur widersprüchlich**
   - `index.html` lud React/ReactDOM weiter vom CDN.
   - `boot.js` und `README.txt` erwarteten aber lokale Vendor-Dateien.
   - Folge: unnötig fragiler lokaler/offline Start.

2. **Popup-Rankings reagierten nicht vollständig auf Orga-/Ticker-Änderungen**
   - In `js/app-main.js` fehlte `orgaData` in relevanten `useMemo`-Abhängigkeiten.
   - Der initiale Rotationsstart reichte `orgaData` nicht an `buildRankingPopupState` weiter.
   - Folge: Popup/Ticker konnte trotz geänderter Orga-Daten veraltet bleiben.

3. **Schrift-Konfiguration inkonsistent**
   - `index.html` lud `Inter` und `Space Grotesk`.
   - `styles/main.css` und das Ranking-Popup verwendeten aber `Rajdhani` und `Orbitron`.
   - Folge: unnötige Fallbacks und uneinheitliche Darstellung.

4. **Metadaten von Modi enthielten Duplikate**
   - Mehrere `af`-Arrays enthielten doppelte Format-IDs.
   - Folge: unnötige Datenlast, schwerer auditierbarer Zustand.

5. **Dead Code / Altlasten**
   - `legacy/app.full.js` war nicht aktiv.
   - `SaveBar()` in `persist.js` war tot.
   - `lastSave` wurde nur geschrieben, nie gelesen.
   - `FS` in `core.js` war im aktiven Pfad unbenutzt.

## Umgesetzte Verbesserungen
- `index.html` auf lokale Vendor-Dateien umgestellt
- `README.txt` an den realen Startpfad angepasst
- `orgaData` in Popup-State-Dependencies ergänzt
- Rotationsstart des Popups auf vollständigen State umgestellt
- Schriftvariablen auf tatsächlich geladene Fonts vereinheitlicht
- `normalizeMode()` um Deduplizierung von `af`, `drawModes`, `refModeIds` erweitert
- tote Hilfsreste aus aktivem Pfad entfernt
- `legacy/` aus dem Release entfernt

## Neue Regressionstests
- `test-index-offline-vendor.js`
- `test-popup-orga-deps.js`
- `test-mode-array-dedup.js`

## Ergebnis
Die App ist nach diesem Audit konsistenter im Startverhalten, robuster bei Popup-/Ticker-Updates, sauberer in den Modus-Metadaten und bereinigt von unnötigen Altlasten.
