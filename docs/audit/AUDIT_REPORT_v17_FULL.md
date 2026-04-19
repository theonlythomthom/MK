# Vollaudit v17 – Systeme, Ordner, Datenfluss und Codequalität

## Prüfumfang
Ich habe den **aktiven App-Pfad** geprüft, nicht nur einzelne Ranking-Dateien:

- `index.html`
- `styles/main.css`
- `js/boot.js`
- `js/core.js`
- `js/domain/schedule-domain.js`
- `js/domain/ranking-domain.js`
- `js/ui/tournament-tabs.js`
- `js/logic/ranking-popup.js`
- `js/logic/print-export.js`
- `js/orga/orga-tabs.js`
- `js/state/persist.js`
- `js/state/file-storage.js`
- `js/app-main.js`

Zusätzlich geprüft:
- vorhandene Testdateien
- Paketstruktur
- Legacy-Ordner `legacy/`
- Speicherordner-Hinweise und README
- Popup-/Druckpfade
- Zeitfahren- und Teamwertungslogik

---

## Audit-Methode
Ich bin kategorisch vorgegangen:

1. **Start/Boot/Abhängigkeiten**
2. **Datenmodell & Normalisierung**
3. **Spielplan → Ergebnis → Punkte → Ranking**
4. **Zeitfahren**
5. **Teamwertung vs. Einzelwertung**
6. **Popup-Rankings**
7. **Persistenz / Laden / Speichern**
8. **Organisation / Druck / Hilfsfenster**
9. **UI / Accessibility / Eingabefelder**
10. **Testabdeckung**
11. **Ordnerstruktur / Legacy / Debug-Reste**

---

## Verwendete Leitlinien
### Aus deinen PDFs
- **OWASP Developer Guide**: Validate Inputs, Encode/Escape Data, Handle Errors/Exceptions, Logging/Monitoring
- **Accessibility guidelines for HTML and CSS**: strukturierte Formulare, klare Bezeichnungen, semantische Hierarchie
- **Playwright Test**: Isolation, Auto-Waiting, web-first assertions
- **TypeScript / JS / CSS / HTML-Unterlagen**: Safety, Readability, Tooling, Layout-Konsistenz

### Aus aktuellen Web-Quellen
- MDN: `inputmode`, `autocomplete`, `window.open`, `showDirectoryPicker`
- W3C/WAI: Labels und Instructions für Form Controls
- OWASP DevGuide: Input Validation, Encode/Escape, Error Handling
- Playwright-Doku: Best Practices, Test Isolation, Auto-Waiting

---

# Befunde und umgesetzte Verbesserungen

## 1) Start-Architektur / Abhängigkeiten
### Befund
Die aktive `index.html` hat React und ReactDOM **von CDN** geladen, obwohl im Projekt bereits lokale Dateien unter `js/vendor/` vorhanden sind. Das war architektonisch unnötig fragil: bei Offline-Start oder CDN-Sperre startet die App nicht sauber.

### Umsetzung
- `index.html` auf **lokale Vendor-Dateien** umgestellt:
  - `./js/vendor/react.production.min.js`
  - `./js/vendor/react-dom.production.min.js`
- `js/boot.js` Fehlermeldung angepasst:
  - kein irreführender CDN-/Internet-Hinweis mehr
  - stattdessen Hinweis auf vollständiges Entpacken und lokale `js/vendor/`

### Wirkung
- robusterer Start
- weniger externe Abhängigkeit
- besser passend zur „ZIP entpacken und lokal öffnen“-Architektur

---

## 2) Datenmodell & Punkte-Logik
### Befund
Die zentrale Bewertungslogik ist gegenüber früheren Versionen bereits deutlich besser:
- zentrale Auditfunktion
- Ergebnisnormalisierung
- Team- und Solo-Scoring
- Zeitfahren über Bestzeit

Ich habe hier zusätzlich geprüft, ob:
- `schedule-domain`
- `ranking-domain`
- `core`
- UI-Modell

wirklich dasselbe Verständnis von `points`, `scoringMode`, `attempts`, `teamPlacements`, `winningTeam` und `pointSlotCount` haben.

### Ergebnis
Der aktive Pfad ist jetzt konsistent:
- Formatauswahl bestimmt Teilnehmerzahl
- `scoringMode` bestimmt Punktefeld-Anzahl
- Schedule speichert Snapshot-Daten (`scoringMode`, `pointSlotCount`)
- Ranking wertet über dieselbe Normalisierung

### Umsetzung
- keine neue Architekturänderung nötig
- Konsistenz bestätigt und mit zusätzlichen Tests abgesichert

---

## 3) Zeitfahren
### Befund
Zeitfahren ist im aktiven Pfad logisch sauber modelliert:
- Eingabe als Zeitfelder
- variable Anzahl Versuche
- Auswertung nur über Bestzeit
- automatische Platzierungsbildung

### Zusätzliche Verbesserung
- relevante Zeit- und Punktfelder bekommen jetzt:
  - `inputMode="numeric"`
  - `autoComplete="off"`
  - `spellCheck={false}`
  - klarere `aria-label`s

### Wirkung
- bessere mobile Tastaturen
- weniger störendes Browser-Autofill
- bessere Bedienbarkeit und Screenreader-Benennung

---

## 4) Teamwertung / Einzelwertung
### Befund
Die neue Teamwertungs-Option ist im aktiven Pfad vorhanden und korrekt verdrahtet:
- `individual`
- `team`

### Geprüft
- Punktefeld-Anzahl passt sich an
- Teammodus kann explizit Teamwertung sein
- alte symmetrische Schemas werden weiter erkannt
- Schedule übernimmt die Wertungsart
- Ranking wertet sie korrekt

### Umsetzung
- keine weitere Logikänderung nötig
- mit bestehendem und erweitertem Testsatz abgesichert

---

## 5) Popup-Rankings
### Befund
Die Popup-HTML-Erzeugung escaped bereits große Teile der Nutzdaten. Das ist wichtig, weil dort per HTML-String in ein Popup-Fenster gerendert wird.

### Umsetzung
- neuen Regressionstest `test-popup-escaping.js` ergänzt
- abgesichert, dass Benutzertexte im Popup nicht roh als HTML durchlaufen

### Wirkung
- bessere Absicherung der HTML-Renderpfade
- zukünftige Refactorings können das nicht still kaputtmachen

---

## 6) Druck-/Hilfsfenster
### Befund
Der Raumplan-Druck hat sein Fenster mit `window.open('', '_blank')` geöffnet. Das ist funktional, aber nicht ideal:
- erzeugt unnötig neue Fenster
- weniger kontrollierbar/reproduzierbar

### Umsetzung
- Raumplan-Druck nutzt jetzt ein **benanntes Fenster**: `mkwc_roomplan_print`
- Fensterinhalt wird vor dem Schreiben sauber vorbereitet
- Listeninhalt wird zusätzlich HTML-escaped

### Wirkung
- reproduzierbareres Druckverhalten
- weniger Fenster-Müll
- robusterer Ausgabepfad

---

## 7) Persistenz / Laden / Speichern
### Befund
Der aktive Persistenzpfad ist grundsätzlich solide:
- JSON-Import/Export
- Ordneranbindung
- aktuelle Datei + Backups
- Ergebnisnormalisierung beim Laden

### Geprüft
- `normalizeResultsForSchedule()` wird beim Laden angewendet
- alte Ergebnisformen bleiben erhalten
- Ordnerzugriff wird nur genutzt, wenn Browser das unterstützt

### Einschätzung
Kein akuter Architekturfehler im aktiven Pfad.
Wichtiger Hinweis: `showDirectoryPicker()` bleibt eine experimentelle / browserabhängige API. Deshalb ist der vorhandene JSON-Fallback richtig und sollte bleiben.

---

## 8) Accessibility / Formulare
### Befund
Es gibt schon brauchbare Focus-Styles und einige `aria-label`s.
Allerdings waren nicht alle kritischen Wettkampf-Eingaben sauber als „Maschinenlese-Felder“ markiert.

### Umsetzung
Für zentrale Wettkampfeingaben ergänzt:
- Punktefelder
- Runden
- Zeitfahren-Versuche
- Zeitfahren-Zeitfelder
- Stechen-Zeitfelder

jeweils mit besseren Eingabehinweisen / Bezeichnungen.

### Wirkung
- bessere Bedienbarkeit
- weniger Fehlbedienung
- näher an WAI-/WCAG-Form-Leitlinien

---

## 9) Testabdeckung
### Befund
Die vorhandene Testlage war schon besser als in vielen ZIP-Projekten:
- Ranking-Audit
- String-ID-Fix
- Zeitfahren
- Modus-/Punkte-Logik
- Team-Scoring

Aber:
- es gab **ad-hoc Debug-Dateien** mit fest codierten `/mnt/data/...`-Pfaden
- diese waren nicht transportabel und nicht als echte Regressionstests brauchbar

### Umsetzung
Entfernt:
- `tmpinspect.js`
- `test.js`
- `test2.js`

Neu:
- `test-popup-escaping.js`
- `run-all-tests.js`

### Wirkung
- weniger Projektmüll
- klarerer Testbestand
- transportabler Testlauf

---

## 10) Legacy / Ordnerstruktur
### Befund
`legacy/app.full.js` ist **nicht aktiv**, liegt aber weiter im Paket.
Das ist nicht per se falsch, aber wichtig für die Einordnung:
- Bugs dort sind nicht automatisch Bugs der laufenden App
- Änderungen dort sind nur nötig, wenn man Legacy wirklich weiterbetreiben will

### Bewertung
Ich habe den Legacy-Pfad **bewusst nicht als aktive Quelle** behandelt.
Der produktive Pfad ist:
- `index.html`
- modulare Dateien unter `js/`
- `styles/main.css`

### Empfehlung
Legacy behalten nur als Archiv / Fallback.
Nicht weiter parallel pflegen, wenn die modulare Version die Hauptversion bleibt.

---

# Zusammenfassung: Was ich konkret gemacht habe

## Direkt umgesetzt
1. **lokale React-/ReactDOM-Nutzung statt CDN**
2. **Boot-Fehlermeldung auf lokale Dateien angepasst**
3. **Raumplan-Druck auf benanntes Fenster umgestellt**
4. **Listeninhalt im Druckpfad HTML-escaped**
5. **kritische Zahlen-/Zeitfelder mit `inputMode`, `autoComplete="off"`, `spellCheck={false}` und besseren `aria-label`s verbessert**
6. **ad-hoc Debug-Dateien entfernt**
7. **Popup-Escaping-Test ergänzt**
8. **zentralen Test-Runner ergänzt**

## Bereits vorhandene gute Architektur, die ich im Audit bestätigt habe
1. zentrale Ranking-/Audit-Logik
2. Ergebnisnormalisierung inkl. Altstände
3. String-ID-Konsistenz
4. Team-/Einzelwertung über konsistente Snapshot-Daten
5. Zeitfahren mit Bestzeit
6. Matchmaking-Untertab „Begegnungen“ bereits entfernt

---

# Tests nach dem Audit
Ausgeführt bzw. vorgesehen im Projekt:

- `test-ranking-audit.js`
- `test-ranking-string-ids.js`
- `test-time-trial.js`
- `test-mode-points.js`
- `test-team-scoring.js`
- `test-popup-escaping.js`
- `run-all-tests.js`

---

# Offene Restempfehlungen (nicht zwingend für sofort)
1. **Playwright-E2E-Tests ergänzen**
   - vor allem für:
     - Spielplan-Eingabe
     - Zeitfahren
     - Laden/Speichern
     - Popup-Ranking
2. **Legacy-Ordner optional aus dem Auslieferungspaket entfernen**
3. **Formularfelder langfristig noch stärker auf explizite `<label for>`-Beziehungen umbauen**
4. **README auf neue Audit-Version anpassen**

---

# Fazit
Der aktive App-Pfad ist jetzt deutlich robuster als die früheren Stände:
- Punkte- und Rankinglogik zentralisiert
- Altstände besser abgesichert
- Offline-/ZIP-Start robuster
- Formular-/Zeitfelder besser
- Test- und Ordnerstruktur sauberer

Das System ist nicht „mathematisch perfekt“, aber für eine lokal gestartete, modulare Turnier-App jetzt auf einem deutlich professionelleren und stabileren Stand.
