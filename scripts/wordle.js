// Wordle: Pro Zug ändere ich einen Buchstaben. Die kleine Wortliste gilt pro Sprache.
// Ich lade Wortpaare, prüfe Eingaben und speichere den Weg vom Start- zum Zielwort.
function startWordLadder() {
  // Ich behalte die Nummern der ersten drei Rätsel bei, damit ich ältere Spielstände weiterhin laden kann.
  const puzzles = {
    de: [
      ['HAUS', 'LAUT', 'easy'],
      ['HAND', 'KIND', 'medium'],
      ['WAND', 'MUND', 'easy'],
      ['FASS', 'MAST', 'easy'],
      ['RANG', 'RIND', 'easy'],
      ['LAST', 'RAUT', 'easy'],
      ['MASS', 'NUSS', 'easy'],
      ['ROSE', 'REST', 'easy'],
      ['KALK', 'HALT', 'easy'],
      ['HELM', 'HOLE', 'easy'],
      ['HAUT', 'MAUS', 'easy'],
      ['BALL', 'HALS', 'easy'],
      ['SANK', 'SONG', 'easy'],
      ['HAUE', 'KAUT', 'easy'],
      ['RAST', 'NASE', 'easy'],
      ['RAUS', 'MARS', 'easy'],
      ['RING', 'HANG', 'easy'],
      ['BASE', 'RAUE', 'easy'],
      ['HART', 'BAUT', 'easy'],
      ['FAND', 'GANG', 'easy'],
      ['FANG', 'SAND', 'easy'],
      ['LAND', 'RUND', 'easy'],
      ['SANG', 'BANK', 'easy'],
      ['VASE', 'HOSE', 'easy'],
      ['HOLM', 'HALL', 'easy'],
      ['WIND', 'FUND', 'easy'],
      ['NOTE', 'TORE', 'easy'],
      ['HELD', 'FELL', 'easy'],
      ['WUND', 'WALD', 'easy'],
      ['MOST', 'LAUB', 'medium'],
      ['MIST', 'NEST', 'medium'],
      ['RAND', 'BUNT', 'medium'],
      ['HASE', 'LAUF', 'medium'],
      ['BART', 'KALT', 'medium'],
      ['SATT', 'HALM', 'medium'],
      ['ROST', 'RAUF', 'medium'],
      ['BUND', 'LANG', 'medium'],
      ['MALT', 'MARK', 'medium'],
      ['BILD', 'BAND', 'medium'],
      ['RASE', 'MUSS', 'medium'],
      ['GELB', 'HELL', 'medium'],
      ['PASS', 'TEST', 'medium'],
      ['KUSS', 'FAST', 'medium'],
      ['DORF', 'TOTE', 'medium'],
      ['WILD', 'DING', 'medium'],
      ['GELD', 'BELL', 'medium'],
      ['DOSE', 'FEST', 'medium'],
      ['KAUF', 'TAUB', 'medium'],
      ['WURM', 'WIRR', 'medium'],
      ['TANK', 'HUND', 'medium'],
      ['LAUS', 'MATT', 'medium'],
      ['TORE', 'DOOF', 'medium'],
      ['HALL', 'FELS', 'medium'],
      ['HALT', 'FELD', 'medium'],
      ['MUND', 'MILD', 'medium'],
      ['NOTE', 'DORN', 'hard'],
      ['HELM', 'RAUE', 'hard'],
      ['BART', 'HOLE', 'hard'],
      ['MIST', 'BALL', 'hard'],
      ['KAUT', 'GELD', 'hard'],
      ['GELB', 'HAUS', 'hard'],
      ['KALK', 'HOSE', 'hard'],
      ['FELS', 'RAUT', 'hard'],
      ['DOSE', 'MAUS', 'hard'],
      ['BUNT', 'MILD', 'hard'],
      ['NEST', 'NUSS', 'hard'],
      ['RAST', 'FELD', 'hard'],
      ['HAUE', 'FEST', 'hard'],
      ['RAUS', 'BELL', 'hard'],
      ['TAUB', 'MALT', 'hard'],
      ['HELL', 'MARS', 'hard'],
      ['TEST', 'HART', 'hard'],
      ['HELD', 'HASE', 'hard'],
      ['LAST', 'FELL', 'hard'],
      ['HOLM', 'FAST', 'hard'],
      ['SATT', 'NASE', 'hard'],
      ['ROST', 'HALS', 'hard'],
      ['KAUF', 'FASS', 'hard'],
      ['PASS', 'ROSE', 'hard'],
      ['KUSS', 'BAUT', 'hard'],
    ],
    en: [
      ['COLD', 'WARM', 'medium'],
      ['HEAD', 'TAIL', 'hard'],
      ['CAT', 'DOG', 'medium'],
      ['FORM', 'PORT', 'easy'],
      ['SINK', 'BANK', 'easy'],
      ['BELT', 'REST', 'easy'],
      ['TIME', 'LAME', 'easy'],
      ['TILE', 'LIME', 'easy'],
      ['FORK', 'CORP', 'easy'],
      ['GAME', 'TAKE', 'easy'],
      ['HELL', 'BULL', 'easy'],
      ['PEST', 'BEAT', 'easy'],
      ['CORD', 'PORE', 'easy'],
      ['FAME', 'FACT', 'easy'],
      ['CORK', 'COME', 'easy'],
      ['BAND', 'SEND', 'easy'],
      ['CARE', 'CORN', 'easy'],
      ['PAIR', 'RAIN', 'easy'],
      ['MINE', 'FILE', 'easy'],
      ['WINE', 'FIND', 'easy'],
      ['POST', 'LAST', 'easy'],
      ['TALL', 'PALE', 'easy'],
      ['TOLD', 'TELL', 'easy'],
      ['FINE', 'FILL', 'easy'],
      ['FACE', 'BAKE', 'easy'],
      ['LATE', 'MAKE', 'easy'],
      ['FAKE', 'TALE', 'easy'],
      ['HARE', 'DATE', 'easy'],
      ['HARM', 'CARD', 'easy'],
      ['FALL', 'MAIL', 'easy'],
      ['SIRE', 'FIRM', 'easy'],
      ['NINE', 'WELD', 'medium'],
      ['POLL', 'BOLD', 'medium'],
      ['MATE', 'HALL', 'medium'],
      ['BARN', 'SANK', 'medium'],
      ['MALE', 'TIRE', 'medium'],
      ['FOLD', 'HARD', 'medium'],
      ['BALL', 'FAIR', 'medium'],
      ['BELL', 'HEAR', 'medium'],
      ['FIRE', 'PORK', 'medium'],
      ['FAIL', 'TAME', 'medium'],
      ['DIME', 'SING', 'medium'],
      ['TOLL', 'FOOL', 'medium'],
      ['CORE', 'FATE', 'medium'],
      ['BOND', 'HEAT', 'medium'],
      ['CURE', 'RATE', 'medium'],
      ['VEST', 'WELL', 'medium'],
      ['TEAL', 'BOAT', 'medium'],
      ['PURE', 'TORN', 'medium'],
      ['WORN', 'FORT', 'medium'],
      ['RIDE', 'MIND', 'medium'],
      ['DARE', 'SAME', 'medium'],
      ['SOFT', 'WORM', 'medium'],
      ['BEST', 'HOLD', 'medium'],
      ['BOLT', 'FULL', 'medium'],
      ['PILE', 'MILD', 'medium'],
      ['HAIR', 'CAKE', 'hard'],
      ['TYPE', 'SELL', 'hard'],
      ['SORT', 'HOME', 'hard'],
      ['WING', 'LOST', 'hard'],
      ['WIND', 'MEAT', 'hard'],
      ['WARN', 'RACE', 'hard'],
      ['FOOD', 'HOPE', 'hard'],
      ['PANT', 'HEAL', 'hard'],
      ['GOAL', 'FAST', 'hard'],
      ['SIDE', 'BORN', 'hard'],
      ['LIKE', 'GOLD', 'hard'],
      ['BARK', 'SOLD', 'hard'],
      ['PULL', 'GOAT', 'hard'],
      ['HILL', 'WIDE', 'hard'],
      ['TAPE', 'SENT', 'hard'],
      ['HAIL', 'FARM', 'hard'],
      ['NAIL', 'SURE', 'hard'],
      ['PAIL', 'SEAT', 'hard'],
      ['BANG', 'PAST', 'hard'],
      ['WARD', 'CAST', 'hard'],
      ['WILD', 'ROPE', 'hard'],
      ['DINE', 'NEST', 'hard'],
      ['PAWN', 'DEAL', 'hard'],
      ['COMB', 'LOFT', 'hard'],
    ],
  }
  // Ich halte pro Sprache eine Wortliste bereit. Ein eingegebenes Wort muss in dieser Liste stehen.
  const words = {
    de: new Set('HAUS MAUS LAUS LAUT RAUS HAUT HAUE RAND RIND HAND KIND LAND BAND SAND WAND RANG MUND HUND FUND BUND HART HALT KALT HALL HELL FELL FELS BALL BELL BILD WILD HALM KALK TANK BANK GANG SANG LANG SANK KANN DANN MANN HANG FANG FAND WIND MILD GELD GELB HELD FELD HELM HOLM BART WERT WORT ORTS WURM WURF WIRF WIRR IHRE EHRE ERBE ERDE EINE EILE MEIN DEIN SEIN BEIN WEIN REST FEST NEST TEST RAST LAST FAST ROST MOST MAST MIST MUSS KUSS NUSS PASS FASS MASS MATT SATT RAUT KAUT BAUT BUNT RUND MARK MARS MALT HALS WALD RING DING WUND HAHN BAHN SONG HASE NASE BASE VASE RASE RAUE TAUB LAUB LAUF KAUF RAUF RUFE LUFT DUFT DORN DORF DOOF TORF TORE TOTE NOTE ROSE DOSE HOSE HOLE HOHL KOHL KÜHL'.split(' ')),
    en: new Set('COLD CORD CARD WARD WARM WORD WORM GOLD BOLD HOLD SOLD TOLD FOLD HARD HARM HEAD HEAL TEAL TELL TALL TAIL HAIL HALL HEAR HEAT SEAL DEAL REAL CAT COT DOT DOG COG BAT RAT HAT HOT POT LOT LOG HARE CARE CURE PURE PORE CORE COMB COME DOME HOME HOPE ROPE RIPE PIPE PILE FILE FIRE FIRM FARM FORM FOAM TOLL HELL HILL FILL FULL BULL PULL POLL POLE PALE SALE MALE TALE TAME SAME GAME FAME LAME LIME LIKE LINE MINE NINE WINE WIDE RIDE SIDE SIRE TIRE TILE TIME DIME DINE FINE FIND FOND FOOD FOOL COOL COAL GOAL GOAT COAT BOAT BOLT BELT BELL BALL FALL FAIL FAIR HAIR PAIR PAIL NAIL MAIL MAIN RAIN PAIN PAWN DAWN DOWN TOWN TORN BORN CORN CORP CORK WORK WORN WARN BARN BARK DARK DART DARE DATE GATE LATE MATE RATE RACE PACE FACE FACT FATE FAKE CAKE MAKE BAKE TAKE TAPE TYPE TYRE SURE SAND SEND SENT BENT BEND BOND BAND BANG BANK SANK SINK SING RING KING WING WIND MIND PINE PINT PANT CANT CAST FAST LAST LOST LOFT SOFT SORT FORT FORK PORK PORT POST PAST PEST PETS SETS GETS JETS VETS VEST BEST REST TEST TEXT NEXT NEST NEWS NEAT BEAT SEAT MEAT SELL WELL WELD WILD MILD MILL'.split(' ')),
  }

  // Ich greife auf das Element ladder-start zu, damit ich es im weiteren Ablauf verwenden kann.
  const start = document.querySelector('#ladder-start')
  // Ich greife auf das Element ladder-target zu, damit ich es im weiteren Ablauf verwenden kann.
  const target = document.querySelector('#ladder-target')
  // Ich greife auf das Element ladder-path zu, damit ich es im weiteren Ablauf verwenden kann.
  const path = document.querySelector('#ladder-path')
  // Ich greife auf das Element ladder-form zu, damit ich es im weiteren Ablauf verwenden kann.
  const form = document.querySelector('#ladder-form')
  // Ich greife auf das Element ladder-input zu, damit ich es im weiteren Ablauf verwenden kann.
  const input = document.querySelector('#ladder-input')
  // Ich greife auf das Element ladder-submit zu, damit ich es im weiteren Ablauf verwenden kann.
  const submit = document.querySelector('#ladder-submit')
  // Ich greife auf das Element ladder-status zu, damit ich es im weiteren Ablauf verwenden kann.
  const status = document.querySelector('#ladder-status')
  const language = () => document.documentElement.lang === 'en' ? 'en' : 'de'
  const initial = (lang, puzzle) => ({ puzzle, path: [puzzles[lang][puzzle][0]] })
  // Ich suche ein ungelöstes Rätsel in der gewählten Sprache auf der aktuellen Schwierigkeitsstufe.
  function nextPuzzle(lang, exclude = -1) {
    const level = levelProgress.difficulty('wordle')
    return puzzles[lang].findIndex(([first, last, difficulty], index) =>
      index !== exclude && difficulty === level && !levelProgress.isSolved('wordle', `${lang}:${first}:${last}`))
  }
  // Ich öffne zuerst ein ungelöstes Rätsel. Falls keines übrig ist, nehme ich das erste Rätsel der aktuellen Stufe.
  function startingPuzzle(lang) {
    const next = nextPuzzle(lang)
    return next === -1 ? puzzles[lang].findIndex(([, , level]) => level === levelProgress.difficulty('wordle')) : next
  }
  // Ich merke mir pro Sprache die Nummer des Rätsels und die Wörter, die schon gespielt wurden.
  const progress = { de: initial('de', startingPuzzle('de')), en: initial('en', startingPuzzle('en')) }
  const state = () => progress[language()]
  let error = ''
  // Ich halte den geplanten Wechsel zum nächsten Worträtsel fest.
  let nextPuzzleTimer

  // Ich vergleiche die Buchstaben an jeder Stelle. Tauschen oder Anhängen zählt nicht als ein Zug.
  function validateMove(previous, word, visited, lang) {
    if (word.length !== previous.length) return 'ladderLength'
    if ([...previous].filter((letter, i) => letter !== word[i]).length !== 1) return 'ladderChange'
    if (!words[lang].has(word)) return 'ladderUnknown'
    if (visited.includes(word)) return 'ladderRepeated'
    return ''
  }

  // Ich zeige die Anzahl der Züge oder den Eingabefehler an und kennzeichne ungültige Eingaben fürs Vorlesen.
  function showStatus(solved) {
    status.textContent = solved ? translate('ladderSolved').replace('{count}', state().path.length - 1)
      : error ? translate(error) : ''
    if (error) input.setAttribute('aria-invalid', 'true')
    else input.removeAttribute('aria-invalid')
  }

  // Ich zeige Start, Ziel und Wortweg an. Nach der Lösung sperre ich die Eingabe bis zum nächsten Rätsel.
  function render() {
    const lang = language()
    const { puzzle, path: chain } = state()
    // Ich zeige die Nummer des aktuellen Rätsels und die Gesamtzahl der Rätsel in derselben Sprache an.
    const total = puzzles[lang].length
    document.querySelector('#puzzle-progress').textContent = lang === 'en'
    ? `Puzzle ${puzzle + 1} of ${total}`
    : `Rätsel ${puzzle + 1} von ${total}`
    const [first, last] = puzzles[lang][puzzle]
    start.textContent = first
    target.textContent = last
    path.replaceChildren(...chain.map(word => {
      const item = document.createElement('li')
      item.textContent = word
      return item
    }))
    const solved = chain.at(-1) === last
    input.disabled = submit.disabled = solved
    input.maxLength = first.length
    document.title = `${translate('ladderName')} · brainly`
    showStatus(solved)
  }

  // Ich leere die Eingabe und setze die Meldung vom letzten Zug zurück.
  function clearInput() {
    input.value = ''
    error = ''
  }

  // Ich breche den geplanten Rätselwechsel ab, etwa wenn die Sprache oder das Rätsel wechselt.
  function stopNextPuzzle() {
    clearTimeout(nextPuzzleTimer)
    nextPuzzleTimer = undefined
  }

  // Ich öffne nach drei Sekunden das nächste ungelöste Rätsel derselben Stufe und Sprache, sofern eines verfügbar ist.
  function queueNextPuzzle() {
    const lang = language()
    const completed = state()
    const [, targetWord] = puzzles[lang][completed.puzzle]
    if (completed.path.at(-1) !== targetWord) return
    const next = nextPuzzle(lang, completed.puzzle)
    if (next === -1) return
    nextPuzzleTimer = setTimeout(() => {
      nextPuzzleTimer = undefined
      if (language() === lang && state() === completed) openPuzzle(next)
    }, 3000)
  }

  // Ich tausche das Rätsel nur in der gewählten Sprache aus und beginne wieder mit dem Startwort.
  function openPuzzle(index) {
    if (index === state().puzzle) return
    stopNextPuzzle()
    progress[language()] = initial(language(), index)
    clearInput()
    render()
  }

  // Ich prüfe das Wort beim Haken oder bei Enter. Nur einen gültigen Zug füge ich dem Wortweg hinzu.
  form.addEventListener('submit', event => {
    event.preventDefault()
    if (input.disabled) return
    const chain = state().path
    const word = input.value.trim().toUpperCase()
    error = validateMove(chain.at(-1), word, chain, language())
    if (error) {
      showStatus(false)
      return
    }
    chain.push(word)
    clearInput()
    render()
    if (input.disabled) {
      const lang = language()
      const [first, last] = puzzles[lang][state().puzzle]
      levelProgress.award('wordle', `${lang}:${first}:${last}`)
      queueNextPuzzle()
    } else {
      input.focus()
    }
  })
  input.addEventListener('input', () => {
    error = ''
    showStatus(false)
  })
  // Ich starte dasselbe Rätsel beim Reset-Pfeil wieder mit dem Startwort.
  form.addEventListener('reset', event => {
    event.preventDefault()
    stopNextPuzzle()
    progress[language()] = initial(language(), state().puzzle)
    clearInput()
    render()
    input.focus()
  })
  // Ich zeige beim Sprachwechsel den gespeicherten Wortweg der gewählten Sprache an.
  document.addEventListener('game-language-change', () => {
    stopNextPuzzle()
    const lang = language()
    if (state().path.length === 1 && puzzles[lang][state().puzzle][2] !== levelProgress.difficulty('wordle')) {
      progress[lang] = initial(lang, startingPuzzle(lang))
    }
    clearInput()
    render()
    queueNextPuzzle()
  })
  render()

  // Ich speichere beide Sprachversionen und prüfe beim Wiederherstellen jeden gespeicherten Zug.
  return {
    translate,
    saveKey: 'wordLadderSave',
    captureSave: () => JSON.stringify(progress),
    restoreSave(snapshot) {
      let saved
      try {
        saved = JSON.parse(snapshot)
      } catch {
        return false
      }
      for (const lang of ['de', 'en']) {
        const entry = saved?.[lang]
        if (!entry || !Number.isInteger(entry.puzzle) || !puzzles[lang][entry.puzzle] ||
          !Array.isArray(entry.path) || entry.path.length > words[lang].size) return false
        const [first, last] = puzzles[lang][entry.puzzle]
        if (entry.path[0] !== first) return false
        for (let i = 1; i < entry.path.length; i++) {
          if (entry.path[i - 1] === last || typeof entry.path[i] !== 'string' ||
            validateMove(entry.path[i - 1], entry.path[i], entry.path.slice(0, i), lang)) return false
        }
      }
      stopNextPuzzle()
      progress.de = saved.de
      progress.en = saved.en
      clearInput()
      render()
      queueNextPuzzle()
      return true
    },
  }
}
