// Ich addiere XP aus gelösten Rätseln und aktiver Minispielzeit und bestimme die Rätselschwierigkeit.
const levelProgress = (() => {
  const prefix = 'puzzle-xp:'
  const minigamePrefix = 'minigame-xp:'
  const minigameKey = /^minigame-xp:(rune|spark):[0-9]+(?:-[0-9]+){3}$/
  const playInterval = 3000
  const xpPerInterval = 5
  const xpPerLevel = 1000
  const xpWithHelp = 50
  const xpWithoutHelp = 100
  const games = ['sudoku', 'mudoku', 'wordle']
  const sessionAwards = new Map()

  // Ich erkenne Minispiel-XP an der Sitzungskennung und an vollständigen Schritten von fünf XP.
  function isMinigameAward(key, xp) {
    return minigameKey.test(key) && Number.isSafeInteger(xp) && xp > 0 && xp % xpPerInterval === 0
  }

  // Ich lese gespeicherte Rätsel- und Minispiel-XP und ergänze den Fortschritt aus diesem Tab.
  function readAwards() {
    const awards = new Map(sessionAwards)
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index)
        if (!key?.startsWith(prefix) && !key?.startsWith(minigamePrefix)) continue
        const xp = Number(localStorage.getItem(key))
        if (key.startsWith(minigamePrefix)) {
          if (isMinigameAward(key, xp)) awards.set(key, Math.max(xp, awards.get(key) ?? 0))
          continue
        }
        // Ich rechne früher gespeicherte Abschlüsse mit der passenden XP-Stufe an.
        if (xp === 5 || xp === xpWithHelp) awards.set(key, xpWithHelp)
        if (xp === 10 || xp === xpWithoutHelp) awards.set(key, xpWithoutHelp)
      }
    } catch {
      // Ich zeige bei blockiertem Browserspeicher die XP aus dem aktuellen Tab an.
    }
    return awards
  }

  // Ich zähle die Anzahl der gelösten Rätsel derselben Kategorie. Die Kennung eines Rätsels dient als Schlüssel.
  function solvedCount(game) {
  const gamePrefix = `${prefix}${game}:`
  return [...readAwards().keys()].filter(key => key.startsWith(gamePrefix)).length
}
  // Ich steigere die Schwierigkeit nach fünf und nach zehn verschiedenen gelösten Rätseln derselben Kategorie.
function difficulty(game) {
  const solved = solvedCount(game)
  if (solved >= 10) return 'hard'
  if (solved >= 5) return 'medium'
  return 'easy'
}

  // Ich erkenne einen abgeschlossenen Fall anhand der Kombination aus Spiel- und Rätselkennung.
  function isSolved(game, puzzle) {
    return readAwards().has(`${prefix}${game}:${puzzle}`)
  }

  // Ich addiere Rätsel- und Minispiel-XP für die Level-Anzeige auf der Startseite.
  function render() {
    const progress = document.querySelector('#level-progress')
    if (!progress) return

    let total = 0
    for (const [key, xp] of readAwards()) {
      if (key.startsWith(minigamePrefix) || games.includes(key.split(':')[1])) total += xp
    }
    // Ich teile die Gesamt-XP durch 1.000. Ganze Tausender erhöhen das Level, der Rest füllt den Fortschrittsbalken.
    const level = 1 + Math.floor(total / xpPerLevel)
    const number = new Intl.NumberFormat(document.documentElement.lang)
    const label = `Level ${number.format(level)} · ${number.format(total)} XP`
    for (const status of document.querySelectorAll('[data-level-status]')) {
      if (status.textContent !== label) status.textContent = label
    }

    progress.max = xpPerLevel
    progress.value = total % xpPerLevel
    document.querySelector('#level-next').textContent =
      `${number.format(progress.value)} / ${number.format(xpPerLevel)} XP → Level ${number.format(level + 1)}`
  }

  // Ich melde dem Charaktercode die Lösung. XP vergebe ich pro Rätsel nur einmal.
  function award(game, puzzle, usedHelp = false) {
    document.dispatchEvent(new Event('puzzle-solved'))
    const key = `${prefix}${game}:${puzzle}`
    if (sessionAwards.has(key)) return
    const xp = usedHelp ? xpWithHelp : xpWithoutHelp
    try {
      if (localStorage.getItem(key) !== null) return
      localStorage.setItem(key, String(xp))
    } catch {
      // Wenn der Browser den Speicher blockiert, behalte ich die XP im aktuellen Tab.
    }
    sessionAwards.set(key, xp)
    render()
  }

  // Ich sammle sichtbare Spielzeit rundenübergreifend und speichere pro geöffneter Spielseite einen XP-Eintrag.
  function trackPlayTime(game) {
    const id = crypto.getRandomValues(new Uint32Array(4)).join('-')
    const key = `${minigamePrefix}${game}:${id}`
    let remaining = 0
    let total = 0
    let visibleSince = document.hidden ? Infinity : performance.now()

    // Ich beginne nach einem Tabwechsel erst wieder beim Sichtbarwerden mit dem Zählen.
    document.addEventListener('visibilitychange', () => {
      visibleSince = document.hidden ? Infinity : performance.now()
    })

    return (start, end) => {
      // Ich rechne nur den sichtbaren Teil des laufenden Spielabschnitts an.
      // Ich runde die Zeitpunkte ab, damit sich bei vielen Einzelbildern keine Rundungsfehler summieren.
      remaining += Math.max(0, Math.floor(end) - Math.floor(Math.max(start, visibleSince)))
      const intervals = Math.floor(remaining / playInterval)
      if (intervals === 0) return 0

      remaining -= intervals * playInterval
      const earned = intervals * xpPerInterval
      total += earned
      sessionAwards.set(key, total)
      try {
        localStorage.setItem(key, String(total))
      } catch {
        // Ich behalte die XP im aktuellen Tab, wenn der Browser den Speicher blockiert.
      }
      render()
      // Ich gebe die gerade vergebenen XP für die Anzeige am Rundenende zurück.
      return earned
    }
  }

  // Ich speichere Rätsel- und Minispiel-XP gemeinsam im bestehenden Kontostand.
  function captureSave() {
    return JSON.stringify([...readAwards()])
  }

  // Ich prüfe den Kontostand vollständig, bevor ich gültige XP in den Browser übernehme.
  function restoreSave(snapshot) {
    let entries
    try {
      entries = JSON.parse(snapshot)
    } catch {
      return false
    }
    if (!Array.isArray(entries) || !entries.every(entry =>
      Array.isArray(entry) && entry.length === 2 &&
      typeof entry[0] === 'string' &&
      (isMinigameAward(entry[0], entry[1]) ||
        (/^puzzle-xp:(sudoku|mudoku|wordle):.+$/.test(entry[0]) &&
          (entry[1] === xpWithHelp || entry[1] === xpWithoutHelp)))
    )) return false

    // Ich ergänze fehlende Rätsel und übernehme je Minispiel-Sitzung den höheren XP-Stand.
    const existing = readAwards()
    for (const [key, xp] of entries) {
      const saved = existing.get(key)
      if (saved !== undefined && (!key.startsWith(minigamePrefix) || saved >= xp)) continue
      existing.set(key, xp)
      try {
        localStorage.setItem(key, String(xp))
      } catch {
        // Ohne Browserspeicher behalte ich den geladenen Fortschritt im aktuellen Tab.
      }
      sessionAwards.set(key, xp)
    }
    render()
    return true
  }

  // Ich speichere auf der Startseite den Namen beim Tippen im Browser.
  const nameInput = document.querySelector('#level-name')
  if (nameInput) {
    const nameKey = 'level-player-name'
    try {
      nameInput.value = localStorage.getItem(nameKey) ?? ''
    } catch {
      // Bei blockiertem Speicher lasse ich das Namensfeld leer.
    }
    nameInput.addEventListener('input', () => {
      try {
        localStorage.setItem(nameKey, nameInput.value)
      } catch {
        // Ohne Browserspeicher behalte ich den Namen bis zum nächsten Laden im Feld.
      }
    })
  }

  document.addEventListener('game-language-change', render)
  window.addEventListener('pageshow', render)
  window.addEventListener('storage', event => {
    if (event.key === null || event.key.startsWith(prefix) || event.key.startsWith(minigamePrefix)) render()
  })
  render()
  return { award, trackPlayTime, difficulty, solvedCount, isSolved, saveKey: 'levelProgressSave', captureSave, restoreSave }
})()
