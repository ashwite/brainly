(() => {
  const storageKey = 'level-character'
  const customImageKey = 'level-custom-character'
  const customCharacter = 'custom'
  const defaultCharacter = '6'
  const characters = [defaultCharacter, '1', '5']
  const documentScript = document.currentScript.src
  function imagePath(number) {
    if (number === customCharacter) return localStorage.getItem(customImageKey)
    return new URL(`../assets/character-${number}.png`, documentScript).href
  }

  function selectedCharacter() {
    try {
      const saved = localStorage.getItem(storageKey)
      if (characters.includes(saved) || (saved === customCharacter && imagePath(saved))) return saved
      return defaultCharacter
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
  const upload = document.querySelector('#character-upload')
  const status = document.querySelector('#character-upload-status')
  let statusKey = ''
  let available = []

  function showUploadStatus(key) {
    statusKey = key
    status.textContent = key ? translate(key) : ''
  }

  function characterName(number) {
    if (number === defaultCharacter) return translate('dogCharacter')
    if (number === customCharacter) return translate('ownCharacter')
    return translate(number === '1' ? 'dinoCharacter' : 'catCharacter')
  }

  function showCharacter(number) {
    setCharacter(portrait, number)
    portrait.alt = characterName(number)
    portrait.hidden = false
  }

  function createOption(number, source = imagePath(number)) {
    return new Promise(resolve => {
      const image = new Image(56, 56)
      image.alt = ''
      image.onerror = () => resolve(null)
      image.onload = () => {
        const label = document.createElement('label')
        const input = document.createElement('input')
        input.type = 'radio'
        input.name = 'level-character'
        input.value = number
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
      image.src = source
    })
  }

  function renderOptions(selected) {
    empty.hidden = available.length > 0
    options.replaceChildren(...available.map(({ label }) => label))
    const current = available.find(({ number }) => number === selected) ?? available[0]
    if (!current) return
    current.input.checked = true
    showCharacter(current.number)
  }

  async function readPng(file) {
    const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer())
    const signature = [137, 80, 78, 71, 13, 10, 26, 10]
    if (!signature.every((byte, index) => bytes[index] === byte)) throw new Error('Invalid PNG')

    const url = URL.createObjectURL(file)
    try {
      const image = new Image()
      image.src = url
      await image.decode()
      const scale = Math.min(1, 768 / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/png')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  async function initializeOptions() {
    const sources = characters.map(number => createOption(number))
    try {
      const source = imagePath(customCharacter)
      if (source) sources.push(createOption(customCharacter, source))
    } catch {
      // Wenn der Browser den Speicher blockiert, biete ich die eingebauten Charaktere an.
    }
    available = (await Promise.all(sources)).filter(Boolean)
    renderOptions(selectedCharacter())
    upload.disabled = false
  }

  upload.addEventListener('change', async () => {
    const file = upload.files[0]
    if (!file) return
    upload.disabled = true
    showUploadStatus('')
    try {
      const source = await readPng(file)
      const option = await createOption(customCharacter, source)
      if (!option) throw new Error('Unreadable PNG')
      try {
        localStorage.setItem(customImageKey, source)
        localStorage.setItem(storageKey, customCharacter)
      } catch {
        showUploadStatus('characterStorageFailed')
        return
      }

      available = [...available.filter(({ number }) => number !== customCharacter), option]
      renderOptions(customCharacter)
      showUploadStatus('characterUploaded')
    } catch {
      showUploadStatus('characterInvalidPng')
    } finally {
      upload.value = ''
      upload.disabled = false
    }
  })

  document.addEventListener('game-language-change', () => {
    showUploadStatus(statusKey)
    for (const { number, input } of available) {
      input.setAttribute('aria-label', characterName(number))
      if (input.checked) portrait.alt = characterName(number)
    }
  })
  initializeOptions()
})()
