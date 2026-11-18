# Kleine Denkpause

Zwei Minispiele für eine kurze Denkpause. Die Seiten bestehen aus HTML, CSS und JavaScript und lassen sich ohne Installation öffnen.

## Lokal starten

Öffne [Sudoku](index.html) oder [Mudoku](mudoku.html) im Browser. Du kannst auch im Hauptordner einen lokalen Server starten:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Danach erreichst du [Sudoku](http://localhost:4173/) und [Mudoku](http://localhost:4173/mudoku.html) über den Server. Im Menü kannst du unter **Spiel wechseln** zwischen beiden Spielen wechseln.

## Sudoku

Fülle das Raster so, dass die Zahlen von 1 bis 9 in jeder Zeile, jeder Spalte und jedem 3×3-Block genau einmal vorkommen. Wähle ein Feld und nutze die Zahlentasten auf der Seite oder deine Tastatur. Mit den Pfeiltasten wechselst du das Feld. Mit Rücktaste, Entf oder einem zweiten Tipp auf das ausgewählte Feld löschst du deine Eingabe.

Die Glühbirne hilft dir bei falschen Eingaben oder zeigt mögliche Zahlen für ein freies Feld. Sobald du ein Sudoku gelöst hast, startet ein neues Rätsel derselben Stufe.

| Datei | Inhalt |
|---|---|
| [index.html](index.html) | Spielfeld, Navigation und Fußzeile |
| [scripts/app.js](scripts/app.js), Abschnitt Sudoku | Rätselerzeugung, Eingaben, Hinweise, Spielstand im Browser und Texte der Oberfläche |

Die Anzahl der vorgegebenen Zahlen steht in `CLUE_COUNTS`. Die Pause vor dem nächsten Sudoku steht in `advanceAfterCompletion()`.

## Mudoku

Lies die Fallakte und ordne vier Verdächtige vier Räumen zu. Gib dann an, wer am Tatort war. In den letzten 20 Fällen musst du zusätzlich die falsche Aussage auswählen.

Über **Fall auswählen** findest du 20 leichte, 20 mittlere und 40 schwere Fälle. Falsche Eingaben werden wellig unterstrichen. Die Fehleranzeige zählt die aktuell falschen Felder. Sobald alles stimmt, erscheint die Auflösung. Nach fünf Sekunden beginnt der nächste Fall derselben Stufe, falls es einen gibt.

| Datei | Inhalt |
|---|---|
| [mudoku.html](mudoku.html) | Fallakte, Flurplan, Fallauswahl und Fußzeile |
| [scripts/app.js](scripts/app.js), Abschnitt Mudoku | Raumzuordnung, Fehleranzeige, Prüfung und Fallwechsel |
| [scripts/navigation.js](scripts/navigation.js) | Menü, Sprachwechsel und Farbwahl |
| [scripts/cases.js](scripts/cases.js) | Fälle, Hinweise und Auflösungen auf Deutsch und Englisch |
| [scripts/text.js](scripts/text.js) | Zweisprachige Texte der Oberfläche |

## Gemeinsame Einstellungen und Dateien

Beide Spiele teilen sich Sprache, Farbtheme und Hell-/Dunkelmodus im Browser. In den HTML-Dateien steht `data-text` für sichtbare Texte und `data-label` für Beschriftungen, die ein Screenreader vorlesen kann.

Sudoku speichert den Spielstand automatisch im Browser. Über **Speichern** und **Laden** können beide Spiele ihren jeweiligen Online-Spielstand im selben Clerk-Konto ablegen.

| Pfad | Inhalt |
|---|---|
| [styles/style.css](styles/style.css) | Gemeinsame Gestaltung und eigene Abschnitte für Sudoku und Mudoku |
| [assets/](assets/) | Logos für helle und dunkle Hintergründe und das Browser-Tab-Symbol |
| [scripts/account.js](scripts/account.js) | Anmeldung und getrennte Online-Spielstände |
| [pages/hilfe.html](pages/hilfe.html) | Gemeinsame Spielanleitungen auf Deutsch und Englisch |
| [pages/impressum.html](pages/impressum.html) und [pages/datenschutz.html](pages/datenschutz.html) | Impressum und Datenschutz |

Die Schriften Jost und WindSong werden von Google Fonts geladen.
