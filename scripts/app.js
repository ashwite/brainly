'use strict';

// Ich starte nur das Spiel, das zur geöffneten Seite gehört.
// Beide Spiele stellen der gemeinsamen Anmeldung dieselben Funktionen bereit.
const gameApp = document.body.dataset.game === 'mudoku' ? startMudoku() : startSudoku();

function startSudoku() {
  // Sudoku: Ich erzeuge Rätsel, prüfe Zahlen und verwalte die Sudoku-Bedienung.

  // 1. Einstellungen und Zustand des aktuellen Spiels.
  // Diesen Namen verwende ich wie ein Etikett für den Spielstand im Browser.
  const SAVE_KEY = 'denkpause-sudoku-v1';
  // Je schwerer das Rätsel, desto weniger Zahlen möchte ich am Anfang vorgeben.
  const CLUE_COUNTS = { easy: 39, medium: 32, hard: 27 };
  const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const boardElement = document.querySelector('#board');
  const numberButtons = document.querySelector('#numbers');
  const levelButtons = document.querySelectorAll('[data-level]');
  const menuButton = document.querySelector('#menu-toggle');
  const navigation = document.querySelector('#navigation');
  const themeButtons = document.querySelectorAll('.theme-toggle');
  const root = document.documentElement;
  let game;
  // Hier merke ich mir das gewählte Feld. Die Felder zählen von 0 bis 80, also steht -1 für keine Auswahl.
  let selectedCell = -1;

  // Jedes Farbtheme besteht aus Name, dunkler Farbe und heller Farbe.
  // Die eigentlichen Seitenfarben stehen passend dazu am Anfang der CSS-Datei.
  const PALETTES = [
    { id: 'mono', name: 'Schwarz & Weiß', dark: '#000000', light: '#fff' },
    { id: 'garden', name: 'Grün & Pink', dark: '#141c14', light: '#f6bdd7' },
    { id: 'rose', name: 'Rot & Pink', dark: '#3b090b', light: '#fa5c5c' },
    { id: 'pink', name: 'Hellpink & Dunkelpink', dark: '#330c15', light: '#ffe0f0' },
    { id: 'blue', name: 'Hellblau & Dunkelblau', dark: '#0a0f36', light: '#7077a1' },
    { id: 'green', name: 'Hellgrün & Dunkelgrün', dark: '#0e2111', light: '#dcefcf' },
    { id: 'lavender', name: 'Lavendel', dark: '#1a0e21', light: '#ebe1ff' },
    { id: 'sunshine', name: 'Orange & Gelb', dark: '#703a03', light: '#fff0a6' },
    { id: 'sand', name: 'Braun & Beige', dark: '#261c12', light: '#f0e2cc' },
  ];

  // Alle übersetzbaren Texte stehen hier nebeneinander.
  // data-text und data-label verbinden die HTML-Elemente mit diesen Schlüsseln.
  // Ich sammle die deutschen und englischen Texte mit denselben Schlüsseln, damit ich die Sprache zentral wechseln kann.
  const TEXT = {
    de: {
      headline: 'Denken statt scrollen.', legalNav: 'Hilfe und rechtliche Informationen', help: 'Hilfe', imprint: 'Impressum', privacy: 'Datenschutz', colors: 'Farbtheme',
      switchGame: 'Spiel wechseln',
      moreFromAshwite: 'Mehr von ashwite',
      account: 'Konto', accountManage: 'Konto verwalten', accountSignIn: 'Anmelden', accountSignUp: 'Konto erstellen',
      accountSave: 'Speichern', accountLoad: 'Laden', accountSignOut: 'Abmelden',
      difficulty: 'Schwierigkeit', language: 'Sprache', easy: 'Leicht', medium: 'Mittel', hard: 'Schwer',
      home: 'Sudoku Startseite', settings: 'Spieleinstellungen', game: 'Sudoku-Spiel',
      board: 'Sudoku-Raster', numbers: 'Zahlen eingeben', number: 'Zahl',
      openMenu: 'Menü öffnen', closeMenu: 'Menü schließen',
      useLight: 'Hellmodus einschalten', useDark: 'Dunkelmodus einschalten',
      row: 'Zeile', column: 'Spalte', empty: 'leer', fixed: 'vorgegeben', incorrect: 'falsch', wrongEntry: 'Diese Zahl ist falsch.',
      hint: 'Hinweis',
      hintSingle: 'Hier passt nur die {digits}.',
      hintCandidates: 'Prüfe hier diese Möglichkeiten: {digits}.',
      hintIncorrect: 'Schau dir deine Zahl in diesem Feld noch einmal an.',
      start: 'Such dir ein freies Feld und leg los.', select: 'Wähle zuerst ein Feld aus.',
      fixedMessage: 'Diese Zahl ist vorgegeben.', completed: 'Geschafft! Das nächste Sudoku startet gleich.',
      replace: 'Schwierigkeit wechseln? Dein aktueller Spielstand wird ersetzt.',
      description: 'Sudoku mit drei Schwierigkeitsstufen und automatischem Spielstand.',
      paletteNames: ['Schwarz & Weiß', 'Grün & Pink', 'Rot & Pink', 'Hellpink & Dunkelpink',
        'Hellblau & Dunkelblau', 'Hellgrün & Dunkelgrün', 'Lavendel', 'Orange & Gelb', 'Braun & Beige']
    },
    en: {
      headline: 'Think instead of scrolling.', legalNav: 'Help and legal information', help: 'Help', imprint: 'Legal notice', privacy: 'Privacy', colors: 'Color theme',
      switchGame: 'Switch game',
      moreFromAshwite: 'More from ashwite',
      account: 'Account', accountManage: 'Manage account', accountSignIn: 'Sign in', accountSignUp: 'Create account',
      accountSave: 'Save', accountLoad: 'Load', accountSignOut: 'Sign out',
      difficulty: 'Difficulty', language: 'Language', easy: 'Easy', medium: 'Medium', hard: 'Hard',
      home: 'Sudoku home', settings: 'Game settings', game: 'Sudoku game',
      board: 'Sudoku grid', numbers: 'Enter numbers', number: 'Number',
      openMenu: 'Open menu', closeMenu: 'Close menu',
      useLight: 'Switch to light mode', useDark: 'Switch to dark mode',
      row: 'Row', column: 'Column', empty: 'empty', fixed: 'given', incorrect: 'incorrect', wrongEntry: 'This number is incorrect.',
      hint: 'Hint',
      hintSingle: 'Only {digits} fits here.',
      hintCandidates: 'Check these possibilities here: {digits}.',
      hintIncorrect: 'Take another look at the number in this cell.',
      start: 'Choose an empty cell to begin.', select: 'Choose a cell first.',
      fixedMessage: 'This number is given.', completed: 'Solved! The next Sudoku is about to start.',
      replace: 'Change difficulty? Your current progress will be replaced.',
      description: 'Sudoku with three difficulty levels and automatic progress saving.',
      paletteNames: ['Black & White', 'Green & Pink', 'Red & Pink', 'Light & Dark Pink',
        'Light & Dark Blue', 'Light & Dark Green', 'Lavender', 'Orange & Yellow', 'Brown & Beige']
    }
  };
  let lastMessage = '';
  let hint;
  const hintButton = document.querySelector('#hint-button');
  const hintMessage = document.querySelector('#hint-message');

  // Ich hole zum Textschlüssel den Text in der aktuellen Seitensprache.
  function translate(key) {
    return TEXT[root.lang === 'en' ? 'en' : 'de'][key];
  }

  // Ich übersetze die Texte und die Beschriftungen für Screenreader anhand der data-Attribute im HTML.
  // Danach aktualisiere ich auch den Browser-Titel, die Bedienelemente und das Raster.
  function updateLanguage() {
    document.querySelectorAll('[data-text]').forEach(element => {
      element.textContent = translate(element.dataset.text);
    });
    document.querySelectorAll('[data-label]').forEach(element => {
      element.setAttribute('aria-label', translate(element.dataset.label));
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === root.lang));
    });
    document.querySelectorAll('[data-palette-choice]').forEach((button, index) => {
      const name = translate('paletteNames')[index];
      button.title = name;
      button.setAttribute('aria-label', name);
    });
    [...numberButtons.children].forEach((button, index) => {
      button.setAttribute('aria-label', `${translate('number')} ${index + 1}`);
    });
    document.title = `Sudoku · ${translate('headline')}`;
    document.querySelector('meta[name="description"]').content = translate('description');
    updateAppearance();
    toggleMenu(!navigation.hidden);
    if (lastMessage) announce(lastMessage);
    if (game) renderBoard();
  }

  // 2. Sudoku erzeugen. Eine 0 bedeutet immer: Dieses Feld ist leer.
  // Ich mische eine Kopie der Liste. Von hinten nach vorne tausche ich jedes Element mit einer Zufallsposition
  // im noch nicht gemischten Teil. Die ursprüngliche Liste bleibt dabei erhalten.
  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
    }
    return result;
  }

  function createSolution() {
    // Zeilen und Spalten werden innerhalb gültiger Dreiergruppen vertauscht.
    // So bleibt das Grundmuster ein gültiges Sudoku.
    // Ich mische die drei Dreiergruppen und auch die Reihenfolge innerhalb jeder Gruppe.
    // Das mache ich getrennt für Zeilen und Spalten, damit die 3×3-Blöcke erhalten bleiben.
    function shuffledGroups() {
      return shuffle([0, 1, 2]).flatMap(group =>
        shuffle([0, 1, 2]).map(offset => group * 3 + offset)
      );
    }
    const rows = shuffledGroups();
    const columns = shuffledGroups();
    const digits = shuffle(DIGITS);
    return rows.flatMap(row => columns.map(column => {
      // Das Grundmuster verschiebt die Zahlen von Zeile zu Zeile. % 9 hält die Position im Bereich 0 bis 8.
      // Die gemischte Zahlenliste ersetzt das Grundmuster durch eine andere gültige Zahlenfolge.
      const position = (row * 3 + Math.floor(row / 3) + column) % 9;
      return digits[position];
    }));
  }

  // Ich rechne die laufende Feldnummer in Zeile und Spalte um.
  // Beispiel: Feld 10 liegt in Zeile 1 und Spalte 1, wenn ich bei 0 anfange zu zählen.
  // In used sammle ich die Zahlen aus derselben Zeile, Spalte und demselben Block. Übrig bleiben die erlaubten Zahlen.
  function possibleDigits(board, index) {
    const row = Math.floor(index / 9);
    const column = index % 9;
    const used = new Set();
    for (let i = 0; i < 9; i++) {
      used.add(board[row * 9 + i]);
      used.add(board[i * 9 + column]);
      const blockRow = Math.floor(row / 3) * 3 + Math.floor(i / 3);
      const blockColumn = Math.floor(column / 3) * 3 + i % 3;
      used.add(board[blockRow * 9 + blockColumn]);
    }
    return DIGITS.filter(digit => !used.has(digit));
  }

  function countSolutions(board, limit = 2) {
    // Probiere zuerst das leere Feld mit den wenigsten Möglichkeiten.
    // Bei zwei Lösungen können wir aufhören: Das Rätsel wäre nicht eindeutig.
    let nextIndex = -1;
    let candidates = [];
    for (let i = 0; i < 81; i++) {
      if (board[i] !== 0) continue;
      const options = possibleDigits(board, i);
      if (options.length === 0) return 0;
      if (nextIndex === -1 || options.length < candidates.length) {
        nextIndex = i;
        candidates = options;
        if (options.length === 1) break;
      }
    }
    // Gibt es kein freies Feld mehr, habe ich auf diesem Weg eine vollständige Lösung gefunden.
    if (nextIndex === -1) return 1;

    let total = 0;
    // Ich setze eine mögliche Zahl probeweise ein und rufe dieselbe Funktion für den Rest des Rasters auf.
    // Danach leere ich das Feld wieder. So bleiben meine Testzahlen beim Zurückgehen nicht im Raster stehen.
    for (const digit of candidates) {
      board[nextIndex] = digit;
      total += countSolutions(board, limit - total);
      if (total >= limit) break;
    }
    board[nextIndex] = 0;
    return total;
  }

  // Ich starte mit einer kompletten Lösung. Daraus mache ich die Vorgabe und eine eigene Kopie für die Eingaben.
  // Ich entferne Zahlen in zufälliger Reihenfolge, bis ich die gewünschte Anzahl erreiche oder alle Felder geprüft habe.
  function startGame(level = 'easy') {
    const solved = createSolution();
    const given = [...solved];
    const positions = shuffle(Array.from({ length: 81 }, (_, index) => index));
    let clueCount = 81;

    // Entferne Zahlen nur dann, wenn genau eine Lösung übrig bleibt.
    for (const index of positions) {
      if (clueCount <= CLUE_COUNTS[level]) break;
      const digit = given[index];
      given[index] = 0;
      if (countSolutions([...given]) === 1) clueCount--;
      else given[index] = digit;
    }
    game = { level, solved, given, values: [...given], done: false };
    selectedCell = -1;
    announce('start');
    saveGame();
    renderBoard();
  }

  // 3. Eingabe und Anzeige. Vorgegebene Zahlen können nicht geändert werden.
  // Ich vergleiche, ob zwei Felder dieselbe Zeile, Spalte oder denselben 3×3-Block teilen.
  function sharesUnit(first, second) {
    const firstRow = Math.floor(first / 9);
    const secondRow = Math.floor(second / 9);
    const firstColumn = first % 9;
    const secondColumn = second % 9;
    return firstRow === secondRow || firstColumn === secondColumn ||
      (Math.floor(firstRow / 3) === Math.floor(secondRow / 3) &&
       Math.floor(firstColumn / 3) === Math.floor(secondColumn / 3));
  }

  // Ich baue die 81 sichtbaren Feld-Buttons aus dem aktuellen Spielstand neu auf.
  // Die CSS-Klassen zeigen Vorgaben, Fehler, die Auswahl und die dazugehörigen Felder an.
  function renderBoard() {
    hintButton.disabled = game.done;
    hintMessage.textContent = hint?.game === game
      ? translate(hint.key).replace('{digits}', hint.digits.join(', '))
      : '';
    boardElement.replaceChildren();
    for (let index = 0; index < 81; index++) {
      const button = document.createElement('button');
      const value = game.values[index];
      const incorrect = !game.given[index] && value !== 0 && value !== game.solved[index];
      button.className = 'cell';
      button.classList.toggle('incorrect', incorrect);
      if (incorrect) button.setAttribute('aria-invalid', 'true');
      button.textContent = value || '';
      button.classList.toggle('given', game.given[index] !== 0);
      button.classList.toggle('selected', selectedCell === index);
      if (selectedCell >= 0) {
        button.classList.toggle('related', sharesUnit(selectedCell, index));
        button.classList.toggle('same', value !== 0 && value === game.values[selectedCell]);
      }
      const row = Math.floor(index / 9) + 1;
      const column = index % 9 + 1;
      const cellLabel = game.given[index] ? 'fixed' : incorrect ? 'incorrect' : '';
      const suffix = cellLabel ? `, ${translate(cellLabel)}` : '';
      button.setAttribute('aria-label', `${translate('row')} ${row}, ${translate('column')} ${column}: ${value || translate('empty')}${suffix}`);
      button.setAttribute('aria-pressed', String(selectedCell === index));
      // Mit Tab soll man einmal ins Spielfeld gelangen. Das gewählte Feld ist der Einstieg, sonst das erste.
      // Innerhalb des Rasters wechseln die Pfeiltasten das Feld.
      button.tabIndex = selectedCell === index || (selectedCell === -1 && index === 0) ? 0 : -1;
      button.onclick = () => selectCell(index);
      boardElement.append(button);
    }
    levelButtons.forEach(button => {
      const active = button.dataset.level === game.level;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function selectCell(index) {
    // Ein zweiter Tipp auf das ausgewählte Feld löscht die eigene Zahl.
    if (selectedCell === index && !game.given[index] && game.values[index]) {
      enterDigit(0);
      return;
    }
    selectedCell = index;
    hint = undefined;
    renderBoard();
  }

  // Bei einem Tipp zeige ich zuerst eine falsche Eingabe, falls es eine gibt.
  // Sonst suche ich ein leeres Feld mit möglichst wenigen gültigen Zahlen und zeige diese als Hinweis.
  hintButton.onclick = () => {
    if (game.done) return;
    const incorrect = game.values.findIndex((value, index) => value !== 0 && value !== game.solved[index]);
    if (incorrect >= 0) {
      selectedCell = incorrect;
      hint = { game, key: 'hintIncorrect', digits: [] };
    } else {
      let digits = [];
      game.values.forEach((value, index) => {
        if (value !== 0) return;
        const candidates = possibleDigits(game.values, index);
        if (!digits.length || candidates.length < digits.length) {
          selectedCell = index;
          digits = candidates;
        }
      });
      if (!digits.length) return;
      hint = { game, key: digits.length === 1 ? 'hintSingle' : 'hintCandidates', digits };
    }
    renderBoard();
  };

  // Ich prüfe, ob das Spiel noch läuft und ein veränderbares Feld ausgewählt ist.
  // Dann trage ich die Zahl ein. Eine 0 leert das Feld. Ich speichere und prüfe, ob alle Felder der Lösung entsprechen.
  function enterDigit(digit) {
    if (game.done) return;
    if (selectedCell < 0) return announce('select');
    if (game.given[selectedCell]) return announce('fixedMessage');
    hint = undefined;
    game.values[selectedCell] = digit;
    if (digit !== 0 && digit !== game.solved[selectedCell]) announce('wrongEntry');
    else if (lastMessage === 'wrongEntry') announce('');
    game.done = game.values.every((value, index) => value === game.solved[index]);
    saveGame();
    renderBoard();
    if (game.done) advanceAfterCompletion();
  }

  function advanceAfterCompletion() {
    announce('completed');
    // Ich merke mir, welches Spiel fertig war. Nach der Wartezeit starte ich nur dann ein neues,
    // wenn zwischenzeitlich kein anderer Spielstand geöffnet wurde.
    const completedGame = game;
    // Kurze Pause, damit das vollständig gelöste Raster noch zu sehen ist.
    setTimeout(() => {
      if (game === completedGame && game.done) startGame(game.level);
    }, 1200);
  }

  // Ich merke mir den Textschlüssel, damit ich die Meldung nach einem Sprachwechsel erneut übersetzen kann.
  // Der Screenreader kann die Änderung im Meldungsfeld vorlesen.
  function announce(key) {
    lastMessage = key;
    document.querySelector('#message').textContent = key ? translate(key) : '';
  }

  // 4. Spielstand speichern. Alte Spielstände nutzen dieselben Felder weiter.
  function saveSetting(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Bei blockiertem Speicher bleibt das Spiel in diesem Tab nutzbar.
    }
  }

  // Ich mache aus dem Sudoku-Spielstand einen JSON-Text, damit der Browser ihn speichern kann.
  function saveGame() {
    saveSetting(SAVE_KEY, JSON.stringify(game));
  }

  // Ich prüfe, ob ein Raster aus genau 81 ganzen Zahlen besteht. Je nach Raster erlaube ich 0 bis 9 oder 1 bis 9.
  function isValidBoard(board, minimum = 0) {
    return Array.isArray(board) && board.length === 81 &&
      board.every(value => Number.isInteger(value) && value >= minimum && value <= 9);
  }

  // Ich lese entweder den mitgegebenen Online-Stand oder den Stand aus dem Browser.
  // Ich prüfe die Schwierigkeit, die Raster, doppelte Ziffern in der Lösung und die unveränderten Vorgaben.
  // Ob das Spiel fertig ist, berechne ich aus den Zahlen selbst.
  function loadGame(serialized) {
    try {
      const saved = JSON.parse(serialized ?? localStorage.getItem(SAVE_KEY));
      if (!saved || !Object.hasOwn(CLUE_COUNTS, saved.level) ||
          !isValidBoard(saved.solved, 1) || !isValidBoard(saved.given) ||
          !isValidBoard(saved.values)) return false;
      if (saved.solved.some((value, index) => saved.solved
          .slice(0, index).some((other, previous) => value === other && sharesUnit(index, previous)))) return false;
      if (!saved.given.every((value, index) => value === 0 ||
          (value === saved.solved[index] && value === saved.values[index]))) return false;
      game = {
        level: saved.level,
        solved: saved.solved,
        given: saved.given,
        values: saved.values,
        done: saved.values.every((value, index) => value === saved.solved[index])
      };
      return true;
    } catch {
      return false;
    }
  }

  // 5. Navigation, Hell-/Dunkelmodus und Farbthemes.
  // Ich klappe das Menü auf oder zu und setze den passenden Zustand und Namen für Screenreader.
  function toggleMenu(open) {
    navigation.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', translate(open ? 'closeMenu' : 'openMenu'));
  }

  // Ich passe Symbole und Markierungen an die gewählten Farben und den Modus an.
  // Die Hintergrundfarbe gebe ich auch an den Browser weiter, damit er sie für seine Oberfläche nutzen kann.
  function updateAppearance() {
    const dark = root.dataset.theme === 'dark';
    themeButtons.forEach(button => {
      button.firstElementChild.textContent = dark ? '☀︎' : '☾';
      button.setAttribute('aria-label', translate(dark ? 'useLight' : 'useDark'));
      button.setAttribute('aria-pressed', String(dark));
    });
    document.querySelectorAll('[data-palette-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.paletteChoice === root.dataset.palette));
    });
    const background = getComputedStyle(root).getPropertyValue('--bg').trim();
    document.querySelector('meta[name="theme-color"]').content = background;
  }

  // Ich baue pro Palette einen Button. Die kleinen Farbflächen haben je eine Farbe für hell und dunkel.
  // Bei einem Klick speichere ich die gewählte Palette für den nächsten Besuch.
  function createPaletteButtons() {
    for (const palette of PALETTES) {
      const button = document.createElement('button');
      button.className = 'palette-choice';
      button.dataset.paletteChoice = palette.id;
      button.title = palette.name;
      button.setAttribute('aria-label', palette.name);
      const swatch = document.createElement('span');
      swatch.className = 'palette-swatch';
      swatch.style.setProperty('--swatch-dark', palette.dark);
      swatch.style.setProperty('--swatch-light', palette.light);
      swatch.setAttribute('aria-hidden', 'true');
      button.append(swatch);
      button.onclick = () => {
        root.dataset.palette = palette.id;
        saveSetting('sudoku-palette', palette.id);
        updateAppearance();
      };
      document.querySelector('#palettes').append(button);
    }
  }

  document.querySelectorAll('[data-language]').forEach(button => {
    button.onclick = () => {
      root.lang = button.dataset.language;
      saveSetting('sudoku-language', root.lang);
      updateLanguage();
    };
  });

  menuButton.onclick = () => toggleMenu(navigation.hidden);
  // Ich wechsle den Modus und speichere die Wahl für den nächsten Besuch.
  function toggleTheme() {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    saveSetting('sudoku-theme', root.dataset.theme);
    updateAppearance();
  }
  themeButtons.forEach(button => button.addEventListener('click', toggleTheme));
  document.addEventListener('click', event => {
    if (!event.target.closest('.header-actions')) toggleMenu(false);
  });
  levelButtons.forEach(button => {
    button.onclick = () => {
      const level = button.dataset.level;
      if (game && level !== game.level) {
        // Vor einem Wechsel der Schwierigkeit vergleiche ich Eingaben und Vorgaben.
        // Wenn das laufende Rätsel eigene Eingaben enthält, frage ich vor dem Ersetzen nach.
        const hasEntries = game.values.some((value, index) => value !== game.given[index]);
        const mayReplace = !hasEntries || game.done ||
          confirm(translate('replace'));
        if (mayReplace) startGame(level);
      }
      toggleMenu(false);
    };
  });

  // Zahlentasten erstellen; die Tastatur bietet dieselben Eingabemöglichkeiten.
  for (const digit of DIGITS) {
    const button = document.createElement('button');
    button.textContent = digit;
    button.setAttribute('aria-label', `${translate('number')} ${digit}`);
    button.onclick = () => enterDigit(digit);
    numberButtons.append(button);
  }

  // Ich lasse Eingabefelder und Dialoge ihre Tasten selbst verarbeiten, damit das Spiel beim Tippen nicht eingreift.
  // Für das Raster übernehme ich Zahlen, Löschtasten und Pfeiltasten.
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.target.closest?.('input, textarea, select, [contenteditable], [role=dialog]')) return;
    if (event.key === 'Escape' && !navigation.hidden) {
      toggleMenu(false);
      menuButton.focus();
      return;
    }
    // In der Navigation bleiben Tab, Pfeiltasten und Kurzbefehle frei nutzbar.
    if (!navigation.hidden || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      enterDigit(Number(event.key));
    } else if (['Backspace', 'Delete', '0'].includes(event.key)) {
      event.preventDefault();
      enterDigit(0);
    } else if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      hint = undefined;
      if (selectedCell < 0) selectedCell = 0;
      else {
        let row = Math.floor(selectedCell / 9);
        let column = selectedCell % 9;
        // Mit % 9 springe ich am Rand zur gegenüberliegenden Seite. +8 entspricht dabei einem Schritt rückwärts im Kreis.
        if (event.key === 'ArrowRight') column = (column + 1) % 9;
        if (event.key === 'ArrowLeft') column = (column + 8) % 9;
        if (event.key === 'ArrowDown') row = (row + 1) % 9;
        if (event.key === 'ArrowUp') row = (row + 8) % 9;
        selectedCell = row * 9 + column;
      }
      renderBoard();
      boardElement.children[selectedCell].focus();
    }
  });
  // Wenn die Seite verlassen wird, versuche ich den aktuellen Stand noch einmal im Browser zu speichern.
  window.addEventListener('pagehide', saveGame);

  // 6. Start: gespeicherte Einstellungen und Spielstand wiederherstellen.
  if (!PALETTES.some(palette => palette.id === root.dataset.palette)) root.dataset.palette = 'mono';
  createPaletteButtons();
  updateLanguage();
  if (loadGame()) {
    renderBoard();
    if (game.done) advanceAfterCompletion();
  } else startGame();

  // Elemente beim ersten Hineinscrollen sanft einblenden.
  // Ich prüfe die Bewegungseinstellung des Geräts. Die Einblendung verwende ich nur, wenn sie erlaubt ist.
  // Der Observer merkt, wann das Raster oder die Zahlentasten in den sichtbaren Bereich kommen.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    document.querySelectorAll('.board-wrap, #numbers').forEach((element, index) => {
      element.classList.add('scroll-reveal');
      element.style.transitionDelay = `${index * 90 + 100}ms`;
      observer.observe(element);
    });
  }

  // Beim Laden aus dem Konto setze ich die Auswahl zurück und zeichne das geladene Raster.
  return {
    translate,
    saveKey: 'sudokuSave',
    captureSave: () => JSON.stringify(game),
    restoreSave(snapshot) {
      if (!loadGame(snapshot)) return false;
      selectedCell = -1;
      saveGame();
      renderBoard();
      if (game.done) advanceAfterCompletion();
      return true;
    },
  };
}

function startMudoku() {
  // Mudoku: Ich zeige den Fall an, prüfe die Eingaben und starte den nächsten Fall.
  // Ich hole die Bedienelemente über ihre IDs aus mudoku.html. # steht für eine ID.
  const form = document.querySelector('#case-form')
  const suspect = document.querySelector('#suspect')
  const falseClue = document.querySelector('#false-clue')
  const picker = document.querySelector('#case-picker')
  const feedback = document.querySelector('#feedback')
  const fieldErrors = document.querySelector('#field-errors')
  const solution = document.querySelector('#solution')
  const levelButtons = document.querySelectorAll('[data-level]')
  let activeCase
  let result = ''
  let nextCaseTimer
  let clueItems = []
  let roomFields = []

  // Die ersten Spielstände hatten nur die Stufe. Diese Fälle bleiben deshalb beim Laden erreichbar.
  const previousCases = Object.entries(legacyCases).map(([level, texts]) => ({
    ...texts,
    id: `legacy-${level}`,
    level,
    people: texts.de.people,
    rooms: texts.de.rooms,
  }))
  const firstCaseByLevel = level => caseCatalog.find(entry => entry.level === level)

  // In jedem Auswahlfeld steht zuerst ein leerer Eintrag. Danach kommen die Personen des aktuellen Falls.
  function addPeople(select) {
    select.replaceChildren(new Option(translate('choose'), ''))
    for (const person of activeCase.people) select.add(new Option(person, person))
  }

  // Ein Fallwechsel baut die leeren Felder auf. Ein Sprachwechsel ändert nur die Texte.
  function startCase(entry) {
    cancelNextCase()
    activeCase = entry
    result = ''

    const clues = document.querySelector('#clues')
    clues.replaceChildren()
    clueItems = entry.de.clues.map(() => {
      const item = document.createElement('li')
      clues.append(item)
      return item
    })

    const rooms = document.querySelector('#rooms')
    rooms.replaceChildren()
    roomFields = entry.rooms.map((_, index) => {
      const item = document.createElement('li')
      const label = document.createElement('label')
      const select = document.createElement('select')
      select.id = `room-${index + 1}`
      select.required = true
      label.htmlFor = select.id
      addPeople(select)
      item.append(label, select)
      rooms.append(item)
      return { label, select }
    })

    addPeople(suspect)
    const hasFalseClue = Boolean(entry.falseClue)
    document.querySelector('#lie-rule').hidden = !hasFalseClue
    document.querySelector('#lie-field').hidden = !hasFalseClue
    falseClue.disabled = !hasFalseClue
    falseClue.required = hasFalseClue
    falseClue.replaceChildren(new Option('', ''))
    if (hasFalseClue) {
      clueItems.forEach((_, index) => falseClue.add(new Option('', String(index + 1))))
    }

    for (const button of levelButtons) {
      const selected = button.dataset.level === entry.level
      button.classList.toggle('active', selected)
      button.setAttribute('aria-pressed', String(selected))
    }
    renderCaseLanguage()
  }

  // Ohne mitgegebenen Fall lese ich die Texte des gerade geöffneten Falls.
  function caseText(entry = activeCase) {
    return document.documentElement.lang === 'en' ? entry.en : entry.de
  }

  // Die Namen der Räume übersetze ich. Die Reihenfolge und die richtige Zuordnung bleiben gleich.
  function roomName(index) {
    return caseText().roomNames?.[index] ?? activeCase.rooms[index].name
  }

  // Ich merke mir den Schlüssel der Rückmeldung, damit sie sich beim Sprachwechsel mitübersetzt.
  function showResult(key) {
    result = key
    const crimeSceneIndex = activeCase.rooms.findIndex(room => room.crimeScene)
    const culprit = activeCase.rooms[crimeSceneIndex].person
    feedback.textContent = key ? translate(key).replace('{person}', culprit).replace('{room}', roomName(crimeSceneIndex)) : ''
    solution.hidden = key !== 'solved'
  }

  // Wie beim Sudoku markiere ich eine falsche Eingabe sofort. Leere Felder zählen nicht als Fehler.
  function updateErrors() {
    const fields = roomFields.map(({ select }, index) => [select, activeCase.rooms[index].person])
    fields.push([suspect, activeCase.rooms.find(room => room.crimeScene).person])
    if (activeCase.falseClue) fields.push([falseClue, String(activeCase.falseClue)])
    let errors = 0
    for (const [field, correct] of fields) {
      const incorrect = Boolean(field.value) && field.value !== correct
      field.classList.toggle('incorrect', incorrect)
      if (incorrect) {
        field.setAttribute('aria-invalid', 'true')
        errors++
      } else {
        field.removeAttribute('aria-invalid')
      }
    }
    const message = translate('errors').replace('{number}', errors)
    if (fieldErrors.textContent !== message) fieldErrors.textContent = message
  }

  // Ich tausche nur die Beschriftungen aus. Die Werte in den Auswahllisten bleiben erhalten.
  function renderCaseLanguage() {
    const text = caseText()
    document.title = `Mudoku · ${text.title}`
    document.querySelector('#case-title').textContent = text.title
    document.querySelector('#case-intro').textContent = text.intro
    document.querySelector('#solution-text').textContent = text.explanation
    clueItems.forEach((item, index) => { item.textContent = text.clues[index] })
    roomFields.forEach(({ label, select }, index) => {
      label.textContent = roomName(index)
      select.options[0].textContent = translate('choose')
    })
    suspect.options[0].textContent = translate('choose')
    falseClue.options[0].textContent = translate('chooseStatement')
    for (let index = 1; index < falseClue.options.length; index++) {
      falseClue.options[index].textContent = translate('statement').replace('{number}', index)
    }
    const entries = caseCatalog.filter(entry => entry.level === activeCase.level)
    if (!entries.includes(activeCase)) entries.unshift(activeCase)
    picker.replaceChildren(...entries.map(entry => {
      const title = caseText(entry).title
      return new Option(typeof entry.id === 'number' ? `${entry.id} · ${title}` : title, String(entry.id))
    }))
    picker.value = String(activeCase.id)
    showResult(result)
    updateErrors()
  }

  document.addEventListener('mudoku-language-change', renderCaseLanguage)
  // Der Wert im Auswahlfeld ist die Fallnummer. Damit finde ich den passenden Fall wieder.
  picker.addEventListener('change', () => {
    const entry = caseCatalog.find(candidate => String(candidate.id) === picker.value)
    if (entry && entry !== activeCase) startCase(entry)
  })
  for (const button of levelButtons) {
    button.addEventListener('click', () => {
      if (activeCase.level !== button.dataset.level) startCase(firstCaseByLevel(button.dataset.level))
      if (!menu.hidden) {
        setMenu(false)
        menuToggle.focus()
      }
    })
  }
  startCase(firstCaseByLevel('easy'))

  form.addEventListener('change', () => {
    updateErrors()
    if (currentAnswer() === 'solved') {
      finishCase()
    } else {
      cancelNextCase()
      showResult('')
    }
  })
  form.addEventListener('reset', event => {
    event.preventDefault()
    startCase(activeCase)
  })

  // Ich prüfe nacheinander doppelte Namen, die Raumzuordnung, den Verdacht und bei Bedarf die falsche Aussage.
  function checkSolution(assignments, accusation, statement) {
    if (new Set(assignments).size !== activeCase.rooms.length) return 'duplicate'
    if (!activeCase.rooms.every((room, index) => room.person === assignments[index])) return 'wrongRoom'
    if (accusation !== activeCase.rooms.find(room => room.crimeScene).person) return 'wrongSuspect'
    if (activeCase.falseClue && statement !== String(activeCase.falseClue)) return 'wrongStatement'
    return 'solved'
  }

  // Ich lese die aktuelle Auswahl direkt aus den Feldern ab und gebe sie an die Prüfung weiter.
  function currentAnswer() {
    return checkSolution(roomFields.map(({ select }) => select.value), suspect.value, falseClue.value)
  }

  // Ich stoppe die Wartezeit, wenn die Eingabe geändert oder der Fall zurückgesetzt wird.
  function cancelNextCase() {
    clearTimeout(nextCaseTimer)
    nextCaseTimer = undefined
  }

  // Ich zeige die Auflösung und suche den nächsten Fall derselben Schwierigkeitsstufe.
  function finishCase() {
    showResult('solved')
    if (nextCaseTimer !== undefined) return

    const completed = activeCase
    const next = caseCatalog.find(entry => entry.level === completed.level &&
      (typeof completed.id !== 'number' || entry.id > completed.id))
    if (!next) return

    // Ich lasse die Auflösung kurz stehen. Ein Wechsel oder Reset bricht das automatische Weitergehen ab.
    nextCaseTimer = setTimeout(() => {
      nextCaseTimer = undefined
      if (activeCase === completed && currentAnswer() === 'solved') startCase(next)
    }, 5000)
  }

  form.addEventListener('submit', event => {
    event.preventDefault()
    const answer = currentAnswer()
    if (answer === 'solved') finishCase()
    else showResult(answer)
  })

  // Ich speichere die Fallnummer zusätzlich zur Stufe. Damit kann ich genau diesen Fall fortsetzen.
  function captureMudokuSave() {
    return JSON.stringify({
      caseId: activeCase.id,
      level: activeCase.level,
      assignments: roomFields.map(({ select }) => select.value),
      suspect: suspect.value,
      statement: activeCase.falseClue ? falseClue.value : '',
      solved: result === 'solved',
    })
  }

  // Ich lese den gespeicherten Text ein und prüfe alle Werte, bevor ich den geöffneten Fall austausche.
  function restoreMudokuSave(snapshot) {
    let saved
    try {
      saved = JSON.parse(snapshot)
    } catch {
      return false
    }

    if (!saved || typeof saved.level !== 'string') return false
    const entry = saved.caseId === undefined
      ? previousCases.find(candidate => candidate.level === saved.level)
      : [...caseCatalog, ...previousCases].find(candidate => candidate.id === saved.caseId)
    if (!entry || entry.level !== saved.level) return false

    const validPeople = ['', ...entry.people]
    const statement = saved.statement ?? ''
    const validStatement = statement === '' || (entry.falseClue &&
      entry.de.clues.some((_, index) => statement === String(index + 1)))
    if (!Array.isArray(saved.assignments) || saved.assignments.length !== entry.rooms.length ||
        !saved.assignments.every(person => validPeople.includes(person)) ||
        !validPeople.includes(saved.suspect) || !validStatement) return false

    startCase(entry)
    roomFields.forEach(({ select }, index) => { select.value = saved.assignments[index] })
    suspect.value = saved.suspect
    falseClue.value = statement
    if (saved.solved === true && checkSolution(saved.assignments, saved.suspect, statement) === 'solved') {
      showResult('solved')
    }
    updateErrors()
    return true
  }

  return {
    translate,
    saveKey: 'mudokuSave',
    captureSave: captureMudokuSave,
    restoreSave: restoreMudokuSave,
  };
}
