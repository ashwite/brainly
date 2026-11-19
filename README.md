# brainly

Drei Minispiele für zwischendurch. Löse ein Sudoku, kläre einen Kriminalfall oder finde einen Weg von einem Wort zum nächsten. In allen drei Spielen sammelst du XP für dasselbe Level.

## So geht’s los

Öffne die [Startseite](pages/home.html) im Browser und wähle [Sudoku](pages/sudoku.html), [Mudoku](pages/mudoku.html) oder [Wordle](pages/wordle.html). Über **Home** im Footer kommst du zurück zur Spielauswahl. Die Schwierigkeit steigt in jedem Spiel separat. Nach fünf verschiedenen gelösten Rätseln startet die mittlere Stufe, nach zehn die höchste. Bereits begonnene Rätsel kannst du zu Ende spielen.

Wenn du die Spiele auf deinem Computer für dich allein öffnest und den XP-Stand zwischen allen drei Spielen teilen möchtest, kannst du sie über einen lokalen Server öffnen. Dafür brauchst du Node.js mit npm und Python 3. Führe im Projektordner diesen Befehl aus.

```sh
npm run dev
```

Lass das Terminal geöffnet und ruf [brainly im Browser](http://localhost:4173/) auf.

## Sudoku

Fülle die freien Felder mit den Zahlen 1 bis 9. Jede Zahl darf in jeder Zeile, jeder Spalte und jedem 3×3-Block nur einmal vorkommen.

Wähle ein freies Feld und tippe auf eine Zahl unter dem Raster oder drücke sie auf der Tastatur. Mit der Rücktaste, der Entf-Taste oder einem zweiten Tipp auf das Feld löschst du deine Eingabe. Die Glühbirne zeigt dir eine falsche Eingabe oder mögliche Zahlen für ein freies Feld. Nach einem gelösten Sudoku beginnt ein neues Rätsel auf deiner aktuellen Stufe.

## Mudoku

Lies die Fallakte und ordne die vier Verdächtigen den vier Räumen zu. Wähle dann die Person aus, die am Tatort war. Bei manchen Fällen musst du zusätzlich angeben, welche Aussage falsch ist.

Falsche Zuordnungen werden wellig unterstrichen. Sobald alle Antworten stimmen, erscheint die Auflösung. Falls es einen weiteren ungelösten Fall auf deiner aktuellen Stufe gibt, öffnet er sich nach einer kurzen Pause.

## Wordle

Erreiche das Zielwort, indem du pro Zug genau einen Buchstaben austauschst. Jeder Zug muss ein gültiges Wort aus der Wortliste ergeben. Du kannst keine Buchstaben hinzufügen, entfernen oder umstellen und darfst ein Wort nur einmal pro Runde verwenden.

Mit **Zug zurück** kannst du den letzten Schritt rückgängig machen. Über die Rätselauswahl kannst du jederzeit ein anderes Rätsel öffnen.

## Level und Charakter

Auf der [Startseite im Level-Bereich](pages/home.html#level) siehst du deine Gesamt-XP und den Fortschritt zum nächsten Level.

| Abschluss | Belohnung |
| --- | --- |
| Richtig gelöst mit Hilfestellung, etwa mit der Glühbirne in Sudoku | 50 XP |
| Richtig gelöst ohne Hilfestellung | 100 XP |

Jedes Rätsel bringt einmal XP. Du startest auf Level 1 und steigst alle **1.000 XP** ein Level auf.

Unter **Dein Name** kannst du zum Beispiel **Anni** eintragen. Klicke auf das Charakterbild, um die Charakterauswahl zu öffnen. Mein Hund Max ist vorausgewählt. Über **+** kannst du ein eigenes PNG auswählen, das in deinem Browser gespeichert wird. Nach einem gelösten Rätsel erscheint dein Charakter kurz in der Bildschirmmitte, zum Beispiel mit **„Super Anni!“** darüber.

Mit **Level als PNG teilen** erstellst du ein Bild mit deinem Level, deinen XP und deinem Charakter. Wenn du einen Namen eingetragen hast, erscheint er ebenfalls auf dem Bild. Je nach Browser öffnet sich das Teilen-Menü oder du kannst das PNG herunterladen.

## Speichern und Laden

Dein Level-Fortschritt bleibt direkt im Browser gespeichert. Sudoku speichert Eingaben sofort. Mudoku und Wordle sichern ihren Rätselstand alle 15 Sekunden und beim Verlassen der Seite. Name und Charakterauswahl bleiben ebenfalls im Browser.

Wenn du angemeldet bist, sichert brainly deinen Level-Fortschritt und den geöffneten Rätselstand alle 15 Sekunden automatisch im Konto. Beim Anmelden und danach alle 20 Sekunden wird der Online-Stand im Hintergrund abgerufen. XP werden zusammengeführt. Ein neuerer Online-Rätselstand wird übernommen, sobald keine ungesicherten lokalen Eingaben vorliegen.

## Sprache, Farben und Hilfe

Im Footer kannst du zwischen Deutsch und Englisch wechseln. Oben rechts schaltest du zwischen Hell- und Dunkelmodus um. Diese Einstellungen gelten für alle drei Spiele und die Startseite.

Über das **i** neben einem Spiel auf der [Startseite](pages/home.html) öffnest du die passende Anleitung. [Datenschutz](pages/datenschutz.html) ist ebenfalls im Footer verlinkt.
