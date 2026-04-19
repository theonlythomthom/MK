# Audit v16 – Punkte, Modi, Zeitfahren und aktive App-Architektur

## Geprüfter Scope
- `index.html` und geladener aktiver Modulpfad
- `js/core.js`
- `js/domain/schedule-domain.js`
- `js/domain/ranking-domain.js`
- `js/ui/tournament-tabs.js`
- `js/app-main.js`
- Persistenzpfad `js/state/persist.js`
- vorhandene Node-Regressions-Tests

## Wichtigste Ergebnisse
1. **Punkte-Schema war nicht zentral an Format + Wertungsart gekoppelt**
   - Problem: Punktefelder hingen bisher nur grob am Format.
   - Risiko: 2 Spieler in einem Modus mit 4er-Default-Schema behalten zu viele Punktefelder; Team-Modi hatten keine eindeutige Trennung zwischen Teamwertung und Einzelfahrerwertung.
   - Umsetzung:
     - zentrale Helfer für Format, Wertungsart und Anzahl Punktefelder
     - automatische Größenanpassung der Punktefelder auf Basis des gewählten Formats
     - konsistente Normalisierung beim Bearbeiten, Hinzufügen und beim Schedule-Bau

2. **Team-Modi hatten keine explizite Wertungsart**
   - Problem: Teammatches wurden immer nach demselben Verteilungsmuster gewertet.
   - Umsetzung:
     - neue `scoringMode`-Logik mit zwei Modi:
       - `team` = Team-Platz zählt direkt
       - `individual` = Team-Platz wird auf Fahrerplätze umgelegt
     - diese Logik wird jetzt von UI, Schedule und Ranking gemeinsam genutzt

3. **Schedule und Ranking hatten keine gemeinsame Snapshot-Info für Punkte-Logik**
   - Problem: der Spielplan trug Punkte, aber nicht explizit die Wertungsart.
   - Umsetzung:
     - Gruppen im Spielplan speichern jetzt zusätzlich:
       - `scoringMode`
       - `pointSlotCount`
     - Ranking-Audit kann dadurch die erwartete Anzahl Punktefelder korrekt validieren

4. **Symmetrische Alt-Daten bei Teammodi mussten sauber migriert werden**
   - Beispiel: `[5,5,0,0]` bei 2v2.
   - Umsetzung:
     - solche Team-Punkteschemata werden sauber als Teamwertung erkannt
     - für Teamwertung werden sie intern auf Team-Felder kollabiert, ohne alte Ergebnisse kaputt zu machen

5. **Matchmaking hatte einen redundanten Tab**
   - Umsetzung:
     - `🤝 Begegnungen` unter `Matchmaking` entfernt
     - Begegnungen bleiben im `Spielplan`

6. **Form-/Eingabeseite konnte zugänglicher werden**
   - Umsetzung:
     - Punktefelder mit `inputMode="numeric"`
     - Zeitfahren-Felder mit `aria-label`
     - verbessert Tastatur-/Screenreader-Kontext und mobile Eingabe

## Geänderte Dateien
- `js/core.js`
- `js/domain/schedule-domain.js`
- `js/domain/ranking-domain.js`
- `js/ui/tournament-tabs.js`
- `js/app-main.js`

## Neue/erweiterte Tests
- `test-ranking-audit.js`
- `test-ranking-string-ids.js`
- `test-time-trial.js`
- `test-mode-points.js`
- `test-team-scoring.js`

## Durchgeführte Checks
- Syntax-Check über alle Dateien in `js/`
- Regressionstests für:
  - Audit/Scoring
  - String-IDs
  - Zeitfahren
  - Punktefeld-Anpassung
  - Teamwertung vs. Einzelfahrerwertung

## Offene Audit-Notizen
1. **`legacy/app.full.js`**
   - Die aktive App lädt laut `index.html` die Moduldateien aus `js/`.
   - Der Legacy-Bundle-Pfad wurde deshalb **nicht** als Source of Truth umgebaut.
   - Empfehlung: nur bei echtem Einsatz separat aus aktiver Logik regenerieren.

2. **E2E-Test-Suite**
   - Für nahezu perfekte Stabilität wäre als nächster Schritt eine echte UI-Test-Suite sinnvoll:
     - Modus anlegen
     - Format wechseln
     - Punktefelder prüfen
     - Teamwertung umstellen
     - Zeitfahren eingeben
     - Ranking validieren

## Fazit
Die Punkte- und Wertungslogik hängt jetzt nicht mehr lose an einzelnen Views, sondern an einem konsistenten Kern:
- Format
- Team-/Einzelfahrerwertung
- Punktefelder
- Schedule-Snapshot
- Ranking-Berechnung
- Audit
