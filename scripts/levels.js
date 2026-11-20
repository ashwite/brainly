// Ich zähle gelöste Rätsel, berechne die Gesamt-XP und bestimme die Schwierigkeit pro Spiel.
const levelProgress = (() => {
  const prefix = 'puzzle-xp:'
  const xpPerLevel = 1000
  const xpWithHelp = 50
  const xpWithoutHelp = 100
  const games = ['sudoku', 'mudoku', 'wordle']
  const sessionAwards = new Map()

  // Ich lese gespeicherte Abschlüsse und ergänze die dieses Tabs. Die Kennung eines Rätsels dient als Schlüssel.
  function readAwards() {
    const awards = new Map(sessionAwards)
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index)
        if (!key?.startsWith(prefix)) continue
        const xp = Number(localStorage.getItem(key))
        // Ich rechne früher gespeicherte Abschlüsse mit der passenden XP-Stufe an.
        if (xp === 5 || xp === xpWithHelp) awards.set(key, xpWithHelp)
        if (xp === 10 || xp === xpWithoutHelp) awards.set(key, xpWithoutHelp)
      }
    } catch {
      // Bei blockiertem Browserspeicher zeige ich die XP aus dem aktuellen Tab an.
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

  function isSolved(game, puzzle) {
    return readAwards().has(`${prefix}${game}:${puzzle}`)
  }

  function render() {
    const progress = document.querySelector('#level-progress')
    if (!progress) return

    let total = 0
    for (const [key, xp] of readAwards()) {
      if (games.includes(key.split(':')[1])) total += xp
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

  // Ich verwandle die Liste der Abschlüsse in JSON, damit ich sie als Text im Konto speichern kann.
  function captureSave() {
    return JSON.stringify([...readAwards()])
  }

  function restoreSave(snapshot) {
    let entries
    try {
      entries = JSON.parse(snapshot)
    } catch {
      return false
    }
    if (!Array.isArray(entries) || !entries.every(entry =>
      Array.isArray(entry) && entry.length === 2 &&
      typeof entry[0] === 'string' && /^puzzle-xp:(sudoku|mudoku|wordle):.+$/.test(entry[0]) &&
      (entry[1] === xpWithHelp || entry[1] === xpWithoutHelp)
    )) return false

    // Ich ergänze gültige Online-Abschlüsse, die im Browser noch fehlen. Vorhandene Einträge bleiben erhalten.
    const existing = readAwards()
    for (const [key, xp] of entries) {
      if (existing.has(key)) continue
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
    if (event.key === null || event.key.startsWith(prefix)) render()
  })
  render()
  return { award, difficulty, solvedCount, isSolved, saveKey: 'levelProgressSave', captureSave, restoreSave }
})()
