# Kleine Denkpause

Drei Minispiele für zwischendurch. Löse ein Sudoku, kläre einen Kriminalfall oder finde einen Weg von einem Wort zum nächsten. In allen drei Spielen sammelst du XP für dasselbe Level.

## So geht’s los

Öffne die [Startseite](pages/home.html) im Browser und wähle [Sudoku](pages/sudoku.html), [Mudoku](pages/mudoku.html) oder [Wordle](pages/wordle.html). Oben rechts findest du das Menü. Unter **Spiel wechseln** kannst du jederzeit zu einem anderen Spiel wechseln. Unter **Schwierigkeit** wählst du zwischen **Leicht**, **Mittel** und **Schwer**.

Wenn du die Spiele auf deinem Computer für dich allein öffnest und den XP-Stand zwischen allen drei Spielen teilen möchtest, kannst du sie über einen lokalen Server öffnen. Dafür brauchst du Node.js mit npm und Python 3. Führe im Projektordner diesen Befehl aus.

```sh
npm run dev
```

Lass das Terminal geöffnet und ruf [Kleine Denkpause im Browser](http://localhost:4173/) auf.

## Sudoku

Fülle die freien Felder mit den Zahlen 1 bis 9. Jede Zahl darf in jeder Zeile, jeder Spalte und jedem 3×3-Block nur einmal vorkommen.

Wähle ein freies Feld und tippe auf eine Zahl unter dem Raster oder drücke sie auf der Tastatur. Mit der Rücktaste, der Entf-Taste oder einem zweiten Tipp auf das Feld löschst du deine Eingabe. Die Glühbirne zeigt dir eine falsche Eingabe oder mögliche Zahlen für ein freies Feld. Nach einem gelösten Sudoku beginnt ein neues Rätsel derselben Stufe.

## Mudoku

Lies die Fallakte und ordne die vier Verdächtigen den vier Räumen zu. Wähle dann die Person aus, die am Tatort war. Bei manchen Fällen musst du zusätzlich angeben, welche Aussage falsch ist.

Falsche Zuordnungen werden wellig unterstrichen. Sobald alle Antworten stimmen, erscheint die Auflösung. Falls es einen weiteren Fall derselben Stufe gibt, öffnet er sich nach einer kurzen Pause.

## Wordle

Erreiche das Zielwort, indem du pro Zug genau einen Buchstaben austauschst. Jeder Zug muss ein gültiges Wort aus der Wortliste ergeben. Du kannst keine Buchstaben hinzufügen, entfernen oder umstellen und darfst ein Wort nur einmal pro Runde verwenden.

Mit **Zug zurück** kannst du den letzten Schritt rückgängig machen. Über die Rätselauswahl kannst du jederzeit ein anderes Rätsel öffnen.

## Level und Charakter

Öffne **Level** im Konto-Bereich des Menüs oder im Footer. Auf der [Level-Seite](pages/level.html) siehst du deine Gesamt-XP, die XP pro Spiel und den Fortschritt zum nächsten Level.

| Abschluss | Belohnung |
| --- | --- |
| Richtig gelöst mit Hilfestellung, etwa mit der Glühbirne in Sudoku | 50 XP |
| Richtig gelöst ohne Hilfestellung | 100 XP |

Jedes Rätsel bringt einmal XP. Du startest auf Level 1 und steigst alle **1.000 XP** ein Level auf.

Unter **Dein Name** kannst du zum Beispiel **Anni** eintragen. Darunter wählst du deinen Charakter. Mein Hund Max ist vorausgewählt. Über das **+** neben den Charakteren kannst du ein eigenes Charakterbild mit transparentem Hintergrund verwenden. Es bleibt in deinem Browser gespeichert. Nach einem gelösten Rätsel erscheint dein Charakter kurz in der Bildschirmmitte, zum Beispiel mit **„Super Anni!“** darüber.

Mit **Level als PNG teilen** erstellst du ein Bild mit deinem Level, deinen XP und deinem Charakter. Wenn du einen Namen eingetragen hast, erscheint er ebenfalls auf dem Bild. Je nach Browser öffnet sich das Teilen-Menü oder du kannst das PNG herunterladen.

## Speichern und Laden

Deine XP, dein Name und deine Charakterauswahl bleiben in dem Browser gespeichert, in dem du spielst. Auch Sudoku merkt sich dein aktuelles Rätsel automatisch.

Mit einem Konto kannst du deinen Fortschritt zusätzlich online sichern. **Speichern** und **Laden** findest du im Konto-Bereich des Menüs und im Footer.

- **Auf einer Spielseite** beziehen sich die Buttons auf den Spielstand dieses Spiels.
- **Auf der Level-Seite** speichern und laden sie deine XP aus allen drei Spielen. Beim Laden werden deine lokalen und online gespeicherten Abschlüsse zusammengeführt. Jedes Rätsel zählt dabei einmal.

## Sprache, Farben und Hilfe

Im Menü kannst du zwischen Deutsch und Englisch wechseln, ein Farbtheme auswählen und den Hell- oder Dunkelmodus einstellen. Diese Einstellungen gelten für alle drei Spiele und die Level-Seite.

Weitere Erklärungen zu den Spielen findest du unter [Hilfe](pages/hilfe.html). [Impressum](pages/impressum.html) und [Datenschutz](pages/datenschutz.html) sind ebenfalls im Footer verlinkt.
