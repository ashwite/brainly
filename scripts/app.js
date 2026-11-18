'use strict';

// Ich starte nur das Spiel, das zur geöffneten Seite gehört.
// Ich stelle der gemeinsamen Anmeldung für alle Spiele dieselben Funktionen bereit.
const games = { sudoku: startSudoku, mudoku: startMudoku, wordle: () => startWordLadder() };
const gameApp = games[document.body.dataset.game]();

function startSudoku() {
  // Sudoku: Ich erzeuge Rätsel, prüfe Zahlen und verwalte die Sudoku-Bedienung.

  // 1. Ich lege die Einstellungen und den Spielzustand fest.
  // Diesen Namen verwende ich wie ein Etikett für den Spielstand im Browser.
  const SAVE_KEY = 'denkpause-sudoku-v1';
  // Je schwerer das Rätsel, desto weniger Zahlen möchte ich am Anfang vorgeben.
  const CLUE_COUNTS = { easy: 39, medium: 32, hard: 27 };
  const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const boardElement = document.querySelector('#board');
  const numberButtons = document.querySelector('#numbers');
  const levelButtons = document.querySelectorAll('[data-level]');
  let game;
  // Hier merke ich mir das gewählte Feld. Die Felder zählen von 0 bis 80, also steht -1 für keine Auswahl.
  let selectedCell = -1;

  let lastMessage = '';
  let hint;
  const hintButton = document.querySelector('#hint-button');
  const hintMessage = document.querySelector('#hint-message');

  function updateSudokuLanguage() {
    [...numberButtons.children].forEach((button, index) => {
      button.setAttribute('aria-label', `${translate('number')} ${index + 1}`);
    });
    document.title = `Sudoku · ${translate('headline')}`;
    document.querySelector('meta[name="description"]').content = translate('description');
    if (lastMessage) announce(lastMessage);
    if (game) renderBoard();
  }
  document.addEventListener('game-language-change', updateSudokuLanguage);

  // 2. Ich erzeuge das Sudoku und verwende eine 0 für leere Felder.
  // Ich mische eine Kopie der Liste von hinten nach vorne.
  // Ich tausche jedes Element mit einer Zufallsposition im noch nicht gemischten Teil.
  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
    }
    return result;
  }

  function createSolution() {
    // Ich vertausche Zeilen und Spalten innerhalb gültiger Dreiergruppen.
    // So erhalte ich ein gültiges Sudoku.
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
      // Ich verschiebe die Zahlen von Zeile zu Zeile und halte die Position mit % 9 zwischen 0 und 8.
      // Mit der gemischten Liste setze ich eine andere gültige Zahlenfolge ein.
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
    // Ich probiere zuerst das leere Feld mit den wenigsten Möglichkeiten.
    // Bei zwei Lösungen höre ich auf, weil das Rätsel dann mehrdeutig ist.
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

    // Ich entferne Zahlen nur, wenn genau eine Lösung übrig bleibt.
    for (const index of positions) {
      if (clueCount <= CLUE_COUNTS[level]) break;
      const digit = given[index];
      given[index] = 0;
      if (countSolutions([...given]) === 1) clueCount--;
      else given[index] = digit;
    }
    game = { level, solved, given, values: [...given], usedHelp: false, done: false };
    selectedCell = -1;
    announce('start');
    saveGame();
    renderBoard();
  }

  // 3. Ich zeige das Raster an und schütze die vorgegebenen Zahlen vor Änderungen.
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

  const cells = Array.from({ length: 81 }, (_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cell';
    button.onclick = () => selectCell(index);
    return button;
  });
  boardElement.append(...cells);

  // Beim Rendern verwende ich dieselben Feld-Buttons, damit der Tastaturfokus erhalten bleibt.
  function renderBoard() {
    hintButton.disabled = game.done;
    hintMessage.textContent = hint?.game === game
      ? translate(hint.key).replace('{digits}', hint.digits.join(', '))
      : '';
    cells.forEach((button, index) => {
      const value = game.values[index];
      const incorrect = !game.given[index] && value !== 0 && value !== game.solved[index];
      button.classList.toggle('incorrect', incorrect);
      if (incorrect) button.setAttribute('aria-invalid', 'true');
      else button.removeAttribute('aria-invalid');
      const displayedValue = value ? String(value) : '';
      if (button.textContent !== displayedValue) button.textContent = displayedValue;
      button.classList.toggle('given', game.given[index] !== 0);
      button.classList.toggle('selected', selectedCell === index);
      button.classList.toggle('related', selectedCell >= 0 && sharesUnit(selectedCell, index));
      button.classList.toggle('same', value !== 0 && value === game.values[selectedCell]);
      const row = Math.floor(index / 9) + 1;
      const column = index % 9 + 1;
      const cellLabel = game.given[index] ? 'fixed' : incorrect ? 'incorrect' : '';
      const suffix = cellLabel ? `, ${translate(cellLabel)}` : '';
      button.setAttribute('aria-label', `${translate('row')} ${row}, ${translate('column')} ${column}: ${value || translate('empty')}${suffix}`);
      button.setAttribute('aria-pressed', String(selectedCell === index));
      // Als Tab-Einstieg verwende ich das ausgewählte Feld oder das erste Feld, wenn keines ausgewählt ist.
      // Innerhalb des Rasters wechsle ich das Feld mit den Pfeiltasten.
      button.tabIndex = selectedCell === index || (selectedCell === -1 && index === 0) ? 0 : -1;
    });
    levelButtons.forEach(button => {
      const active = button.dataset.level === game.level;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function selectCell(index) {
    // Bei einem zweiten Tipp auf das ausgewählte Feld lösche ich die eingegebene Zahl.
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
    game.usedHelp = true;
    saveGame();
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
    if (game.done) {
      const puzzle = `${game.given.join('')}:${game.solved.join('')}`;
      levelProgress.award('sudoku', puzzle, game.usedHelp);
      advanceAfterCompletion();
    }
  }

  function advanceAfterCompletion() {
    announce('completed');
    // Ich merke mir, welches Spiel fertig war.
    // Nach der Wartezeit starte ich ein neues Spiel, wenn noch dasselbe Rätsel geöffnet ist.
    const completedGame = game;
    // Ich lasse das gelöste Raster kurz sichtbar.
    setTimeout(() => {
      if (game === completedGame && game.done) startGame(game.level);
    }, 2300);
  }

  // Ich merke mir den Textschlüssel, damit ich die Meldung nach einem Sprachwechsel erneut übersetzen kann.
  // Ich stelle die Änderung im Meldungsfeld für Screenreader bereit.
  function announce(key) {
    lastMessage = key;
    document.querySelector('#message').textContent = key ? translate(key) : '';
  }

  // 4. Ich speichere den Spielstand und lese weiterhin die Felder älterer Spielstände ein.
  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    } catch {
      // Wenn der Browser den Speicher blockiert, behalte ich den Spielstand im aktuellen Tab.
    }
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
        usedHelp: saved.usedHelp === true,
        done: saved.values.every((value, index) => value === saved.solved[index])
      };
      return true;
    } catch {
      return false;
    }
  }

  // 5. Ich verarbeite die Schwierigkeitswahl und Tastatureingaben.
  function mayReplaceGame() {
    return game.done || game.values.every((value, index) => value === game.given[index]) ||
      confirm(translate('replace'));
  }

  levelButtons.forEach(button => {
    button.onclick = () => {
      const level = button.dataset.level;
      if (game && level !== game.level) {
        // Vor einem Wechsel der Schwierigkeit vergleiche ich Eingaben und Vorgaben.
        // Wenn das laufende Rätsel eigene Eingaben enthält, frage ich vor dem Ersetzen nach.
        if (mayReplaceGame()) startGame(level);
      }
      if (!menu.hidden) {
        setMenu(false);
        menuToggle.focus();
      }
    };
  });

  // Ich erstelle Zahlentasten für dieselben Eingaben, die ich über die Tastatur annehme.
  for (const digit of DIGITS) {
    const button = document.createElement('button');
    button.textContent = digit;
    button.onclick = () => enterDigit(digit);
    numberButtons.append(button);
  }

  // Ich lasse Eingabefelder und Dialoge ihre Tasten selbst verarbeiten, damit das Spiel beim Tippen nicht eingreift.
  // Für das Raster übernehme ich Zahlen, Löschtasten und Pfeiltasten.
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.target.closest?.('input, textarea, select, [contenteditable], [role=dialog]')) return;
    if (!menu.hidden || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.closest?.('button, a') &&
        !boardElement.contains(event.target) && !numberButtons.contains(event.target)) return;
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

  // 6. Beim Start stelle ich die gespeicherten Einstellungen und den Spielstand wieder her.
  updateSudokuLanguage();
  const url = new URL(window.location.href);
  const requestedDifficulty = url.searchParams.get('difficulty');
  const hasRequestedDifficulty = Object.hasOwn(CLUE_COUNTS, requestedDifficulty);
  if (!loadGame() || (hasRequestedDifficulty && game.level !== requestedDifficulty && mayReplaceGame())) {
    startGame(hasRequestedDifficulty ? requestedDifficulty : undefined);
  } else {
    renderBoard();
    if (game.done) advanceAfterCompletion();
  }

  if (hasRequestedDifficulty) {
    url.searchParams.delete('difficulty');
    window.history.replaceState(window.history.state, '', url);
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

  // Ich unterstütze die ersten Spielstände, in denen nur die Stufe gespeichert war, mit den ursprünglichen Fällen.
  const previousCases = Object.entries(legacyCases).map(([level, texts]) => ({
    ...texts,
    id: `legacy-${level}`,
    level,
    people: texts.de.people,
    rooms: texts.de.rooms,
  }))
  const firstCaseByLevel = level => caseCatalog.find(entry => entry.level === level)

  // Ich setze einen leeren Eintrag an den Anfang und ergänze danach die Personen des aktuellen Falls.
  function addPeople(select) {
    select.replaceChildren(new Option(translate('choose'), ''))
    for (const person of activeCase.people) select.add(new Option(person, person))
  }

  // Beim Fallwechsel baue ich die Felder neu auf. Beim Sprachwechsel ändere ich nur die Texte.
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

  document.addEventListener('game-language-change', renderCaseLanguage)
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
    if (result === 'solved') return
    showResult('solved')
    levelProgress.award('mudoku', activeCase.id)
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
