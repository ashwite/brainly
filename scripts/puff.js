(() => {
  // Ich verwende die sichtbare Feldgröße als Koordinatensystem für Ballon und Wolken.
  const field = document.querySelector('#puff-field')
  const ctx = field.getContext('2d')
  // Ich greife auf das Element puff-status zu, damit ich es im weiteren Ablauf verwenden kann.
  const status = document.querySelector('#puff-status')
  const recordPlayTime = levelProgress.trackPlayTime('puff')
  // Ich speichere Wolkenpaare und ihre jeweiligen Lücken in der laufenden Runde.
  const clouds = []
  const rabbit = new Image()
  const darkRabbit = document.createElement('canvas')
  rabbit.src = new URL('../assets/puff-player.png', document.currentScript.src).href

  const playerWidth = 59
  const playerHeight = 112
  const cloudWidth = 48
  let x = 0
  let y = 0
  let velocity = 0
  // Ich merke mir, ob gerade eine Runde läuft und Eingaben annehmen darf.
  let running = false
  // Ich speichere, ob die Leertaste gerade gehalten wird.
  let spaceHeld = false
  // Ich merke mir, welcher Finger oder Mauszeiger den Ballon steuert.
  let pointerId = null
  // Ich speichere die Zeit des vorigen Bilds für Bewegung und XP.
  let previousTime = 0
  // Ich merke mir die XP dieser Runde für die Meldung am Spielende.
  let roundXp = 0
  // Ich speichere den Fortschritt der Platzanimation.
  let popTime = 0
  // Ich merke mir den Startzeitpunkt der Platzanimation.
  let popStarted = 0

  // Ich zeichne die Wolken an beiden Rändern und lasse dazwischen eine Durchflugöffnung frei.
  function drawCloud(x, top, bottom) {
    const height = bottom - top
    if (height <= 0) return
    ctx.beginPath()
    ctx.roundRect(x, top, cloudWidth, height, Math.min(23, height / 2))
    ctx.stroke()
  }

  // Ich zeichne Wolken und Spielfigur in der Farbe des aktuellen Modus.
  function draw() {
    ctx.clearRect(0, 0, field.width, field.height)
    const dark = document.documentElement.dataset.theme === 'dark'
    ctx.strokeStyle = dark ? '#fff' : '#000'
    ctx.fillStyle = ctx.strokeStyle
    ctx.lineWidth = 2
    for (const cloud of clouds) {
      const [top, bottom] = opening(cloud)
      drawCloud(cloud.x, -20, top)
      drawCloud(cloud.x, bottom, field.height + 20)
    }

    if (popTime >= 1) return
    if (popTime > 0) {
      // Ich lasse beim Platzen kleine Funken vom Ballon wegfliegen.
      ctx.globalAlpha = 1 - popTime
      for (let i = 0; i < 8; i += 1) {
        const angle = i * Math.PI / 4
        const radius = 9 + popTime * 32
        ctx.fillRect(x + Math.cos(angle) * radius, y + 15 + Math.sin(angle) * radius, 3, 3)
      }
      ctx.globalAlpha = 1
      return
    }

    // Ich zeichne den Hasen und seine Ballons als gemeinsames PNG im Kollisionsbereich.
    if (rabbit.complete && rabbit.naturalWidth) {
      ctx.drawImage(dark ? darkRabbit : rabbit, x - playerWidth / 2, y, playerWidth, playerHeight)
    }
  }

  // Ich halte die Wolkenöffnung auf kleinen und großen Bildschirmen gut erreichbar.
  function opening(cloud) {
    const gap = Math.max(playerHeight + 68, field.height * 0.5)
    const top = cloud.position * (field.height - gap)
    return [top, top + gap]
  }

  // Ich übernehme die sichtbaren Feldmaße und passe die Positionen an die neue Größe an.
  function resize() {
    const bounds = field.getBoundingClientRect()
    const width = Math.round(bounds.width)
    const height = Math.round(bounds.height)
    if (!width || !height || (width === field.width && height === field.height)) return
    const horizontalScale = width / field.width
    y = Math.max(0, Math.min(y * height / field.height, height - playerHeight))
    for (const cloud of clouds) cloud.x *= horizontalScale
    field.width = width
    field.height = height
    x = Math.min(150, width * 0.23)
    if (!running && !popStarted) y = (height - playerHeight) / 2
    draw()
  }

  // Ich blende die Figur aus und melde die Runden-XP an die Charakteranzeige.
  function finish() {
    popTime = 1
    draw()
    popStarted = 0
    document.dispatchEvent(new CustomEvent('minigame-finished', { detail: { xp: roundXp } }))
  }

  // Ich spiele die Funkenanimation bis zum Ende ab und lasse danach einen Neustart zu.
  function animatePop(time) {
    popTime = Math.max(0.001, (time - popStarted) / 360)
    if (popTime >= 1) finish()
    else {
      draw()
      requestAnimationFrame(animatePop)
    }
  }

  // Ich beende die Zeitmessung beim Wolkenkontakt und zeige die XP nach dem Platzen an.
  function collide() {
    running = false
    status.textContent = document.documentElement.lang === 'en' ? 'Balloon popped' : 'Ballon geplatzt'
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish()
    else {
      popStarted = performance.now()
      requestAnimationFrame(animatePop)
    }
  }

  // Ich erfasse die Spielzeit vor der Bewegung und begrenze den Physikschritt bei langen Bildpausen.
  function frame(time) {
    roundXp += recordPlayTime(previousTime, time)
    const dt = Math.min((time - previousTime) / 1000, 0.05)
    previousTime = time

    // Ich beschleunige beim Halten nach oben und lasse den Ballon beim Loslassen absinken.
    const rising = spaceHeld || pointerId !== null
    velocity = Math.max(-200, Math.min(160, velocity + (rising ? -680 : 480) * dt))
    const nextY = y + velocity * dt
    y = Math.max(0, Math.min(nextY, field.height - playerHeight))
    if (y !== nextY) velocity = 0

    // Ich prüfe jede Wolke auf Kontakt mit dem Bildbereich von Hase und Ballons.
    for (const cloud of clouds) {
      cloud.x -= 145 * dt
      const [top, bottom] = opening(cloud)
      if (x + playerWidth / 2 > cloud.x && x - playerWidth / 2 < cloud.x + cloudWidth &&
          (y < top || y + playerHeight > bottom)) {
        collide()
        return
      }
    }
    if (clouds[0].x + cloudWidth < 0) clouds.shift()
    if (!clouds.length || clouds.at(-1).x < field.width - 235) {
      clouds.push({ x: field.width, position: 0.22 + Math.random() * 0.56 })
    }

    draw()
    requestAnimationFrame(frame)
  }

  // Ich setze Ballon, Wolken und Runden-XP beim nächsten Tipp oder Tastendruck zurück.
  function start() {
    if (running || popStarted) return
    clouds.length = 0
    clouds.push({ x: field.width, position: 0.5 })
    y = (field.height - playerHeight) / 2
    velocity = 0
    roundXp = 0
    popTime = 0
    running = true
    previousTime = performance.now()
    status.textContent = ''
    field.focus({ preventScroll: true })
    requestAnimationFrame(frame)
  }

  // Ich verfolge das Halten auch dann weiter, wenn der Finger das Feld beim Ziehen verlässt.
  field.addEventListener('pointerdown', event => {
    if (event.button !== 0 || pointerId !== null || popStarted) return
    pointerId = event.pointerId
    field.setPointerCapture(pointerId)
    start()
  })
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    field.addEventListener(type, event => {
      if (pointerId === event.pointerId) pointerId = null
    })
  }

  // Ich starte und steuere mit der Leertaste, solange der Fokus außerhalb der Navigation und Anleitung liegt.
  document.addEventListener('keydown', event => {
    if (event.code !== 'Space' || event.target.closest('header, .site-footer, .game-help, a, button, input, textarea, [contenteditable]')) return
    event.preventDefault()
    if (event.repeat || popStarted) return
    spaceHeld = true
    start()
  })
  // Ich beende die Eingabe beim Loslassen der Taste.
  document.addEventListener('keyup', event => {
    if (event.code === 'Space') spaceHeld = false
  })
  // Ich setze gehaltene Eingaben zurück, wenn das Fenster den Fokus verliert.
  window.addEventListener('blur', () => {
    spaceHeld = false
    pointerId = null
  })

  // Ich erzeuge aus der PNG-Transparenz eine weiße Variante für den Dunkelmodus.
  rabbit.addEventListener('load', () => {
    darkRabbit.width = rabbit.naturalWidth
    darkRabbit.height = rabbit.naturalHeight
    const darkContext = darkRabbit.getContext('2d')
    darkContext.drawImage(rabbit, 0, 0)
    darkContext.globalCompositeOperation = 'source-in'
    darkContext.fillStyle = '#fff'
    darkContext.fillRect(0, 0, darkRabbit.width, darkRabbit.height)
    draw()
  })
  new ResizeObserver(resize).observe(field)
  new MutationObserver(draw).observe(document.documentElement, { attributeFilter: ['data-theme'] })
  resize()
})()
