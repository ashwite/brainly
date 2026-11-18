const levelProgress = (() => {
  const prefix = 'puzzle-xp:'
  const xpPerLevel = 1000
  const xpWithHelp = 50
  const xpWithoutHelp = 100
  const games = ['sudoku', 'mudoku', 'wordle']
  const sessionAwards = new Map()

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

  function render() {
    const progress = document.querySelector('#level-progress')
    if (!progress) return

    const totals = { sudoku: 0, mudoku: 0, wordle: 0 }
    for (const [key, xp] of readAwards()) {
      const game = key.split(':')[1]
      if (Object.hasOwn(totals, game)) totals[game] += xp
    }
    const total = games.reduce((sum, game) => sum + totals[game], 0)
    const level = 1 + Math.floor(total / xpPerLevel)
    const number = new Intl.NumberFormat(document.documentElement.lang)
    const label = `Level ${number.format(level)} · ${number.format(total)} XP`
    for (const status of document.querySelectorAll('[data-level-status]')) {
      if (status.textContent !== label) status.textContent = label
    }

    document.querySelector('#level-rules').textContent = document.documentElement.lang === 'en'
      ? `Earn ${xpWithHelp} XP per puzzle solved with a hint, or ${xpWithoutHelp} XP without one.`
      : `Mit Hilfestellung gibt es ${xpWithHelp} XP pro gelöstem Rätsel, ohne Hilfestellung ${xpWithoutHelp} XP.`
    progress.max = xpPerLevel
    progress.value = total % xpPerLevel
    document.querySelector('#level-next').textContent =
      `${number.format(progress.value)} / ${number.format(xpPerLevel)} XP → Level ${number.format(level + 1)}`
    for (const game of games) {
      document.querySelector(`[data-game-xp="${game}"]`).textContent = `${number.format(totals[game])} XP`
    }
  }

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
  return { award, saveKey: 'levelProgressSave', captureSave, restoreSave }
})()
