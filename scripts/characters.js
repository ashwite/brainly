(() => {
  const storageKey = 'level-character'
  const defaultCharacter = '6'
  const characters = [defaultCharacter, '1', '2', '3', '4', '5']
  const documentScript = document.currentScript.src
  const imagePath = number => new URL(
    `../assets/characters/character-${number}.png`, documentScript
  ).href

  function selectedCharacter() {
    try {
      const saved = localStorage.getItem(storageKey)
      return characters.includes(saved) ? saved : defaultCharacter
    } catch {
      return defaultCharacter
    }
  }

  function setCharacter(image, number) {
    image.dataset.character = number
    image.src = imagePath(number)
  }

  const portrait = document.querySelector('#level-character')
  if (!portrait) {
    const celebration = document.createElement('div')
    const message = document.createElement('p')
    const image = new Image(144, 144)
    image.alt = ''
    celebration.className = 'character-celebration'
    celebration.hidden = true
    setCharacter(image, selectedCharacter())
    celebration.append(message, image)
    document.body.append(celebration)

    let hideTimer
    function hideCelebration() {
      clearTimeout(hideTimer)
      celebration.hidden = true
    }
    celebration.addEventListener('animationend', hideCelebration)
    document.addEventListener('puzzle-solved', () => {
      let name = ''
      try {
        name = localStorage.getItem('level-player-name')?.trim() ?? ''
      } catch {
        // Ohne Browserspeicher zeige ich den Glückwunsch ohne Namen.
      }
      message.textContent = name ? `Super ${name}!` : 'Super!'
      setCharacter(image, selectedCharacter())
      celebration.hidden = false
      for (const animation of celebration.getAnimations()) animation.currentTime = 0
      clearTimeout(hideTimer)
      hideTimer = setTimeout(hideCelebration, 2200)
    })
    return
  }

  const options = document.querySelector('#character-options')
  const empty = document.querySelector('#character-empty')
  const selected = selectedCharacter()

  const characterName = number => number === defaultCharacter
    ? translate('dogCharacter')
    : translate('characterName').replace('{number}', number)

  function showCharacter(number) {
    setCharacter(portrait, number)
    portrait.alt = characterName(number)
    portrait.hidden = false
  }

  function createOption(number) {
    return new Promise(resolve => {
      const image = new Image(56, 56)
      image.alt = ''
      image.onerror = () => resolve(null)
      image.onload = () => {
        const label = document.createElement('label')
        const input = document.createElement('input')
        input.type = 'radio'
        input.name = 'level-character'
        input.value = String(number)
        input.setAttribute('aria-label', characterName(number))
        label.append(input, image)
        input.addEventListener('change', () => {
          showCharacter(number)
          try {
            localStorage.setItem(storageKey, input.value)
          } catch {
            // Wenn der Browser den Speicher blockiert, behalte ich die Auswahl bis zum nächsten Laden.
          }
        })
        resolve({ number, input, label })
      }
      image.src = imagePath(number)
    })
  }

  Promise.all(characters.map(createOption)).then(results => {
    const available = results.filter(Boolean)
    empty.hidden = available.length > 0
    if (!available.length) return
    options.replaceChildren(...available.map(({ label }) => label))
    const current = available.find(({ input }) => input.value === selected) ?? available[0]
    current.input.checked = true
    showCharacter(current.number)

    document.addEventListener('game-language-change', () => {
      for (const { number, input } of available) {
        input.setAttribute('aria-label', characterName(number))
        if (input.checked) portrait.alt = characterName(number)
      }
    })
  })
})()
