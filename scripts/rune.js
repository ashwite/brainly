(() => {
  // Ich hole die Spielfläche, die Figurenbilder und den vorlesbaren Rundenstatus aus der Seite.
  const field = document.querySelector('#field')
  // Ich greife auf das Element rune-obstacle zu, damit ich es im weiteren Ablauf verwenden kann.
  const obstacleImage = document.querySelector('#rune-obstacle')
  // Ich greife auf das Element rune-player zu, damit ich es im weiteren Ablauf verwenden kann.
  const player = document.querySelector('#rune-player')
  // Ich greife auf das Element status zu, damit ich es im weiteren Ablauf verwenden kann.
  const status = document.querySelector('#status')

  // Ich rechne senkrecht mit der Canvas-Höhe und trenne die Kollisionsbereiche von der Bildgröße.
  const ground = field.height
  // Ich setze die Beschleunigung fest, mit der Rune zur Bodenlinie zurückfällt.
  const gravity = 1250
  const runner = { x: 210, y: ground - 48, width: 28, height: 48 }
  const obstacle = { x: 480, y: ground - 32, width: 24, height: 32 }
  let velocity = 0
  // Ich merke mir die XP dieser Runde für die Meldung am Spielende.
  let roundXp = 0
  // Ich zähle übersprungene Hindernisse für die Geschwindigkeit.
  let passedObstacles = 0
  // Ich merke mir, ob gerade eine Runde läuft und Eingaben annehmen darf.
  let running = false
  // Ich sperre Eingaben, bis Rune nach der Kollision wieder sichtbar ist.
  let respawning = false
  // Ich speichere die Zeit des vorigen Bilds für Bewegung und XP.
  let previousTime = 0
  // Ich sammle XP nur während laufender Runden und bei sichtbarem Tab.
  const recordPlayTime = levelProgress.trackPlayTime('rune')

  // Ich setze die Bilder an ihre Spielpositionen und passe die Sprunghöhe optisch der sichtbaren Feldhöhe an.
  function draw() {
    player.style.left = `${runner.x}px`
    player.style.bottom = `${(ground - runner.y - runner.height) / ground * 100}%`
    obstacleImage.style.left = `${obstacle.x + obstacle.width / 2}px`
  }

  // Ich gleiche die Spielbreite an die sichtbare Breite an.
  function resizeField() {
    const oldWidth = field.width
    const newWidth = Math.round(field.getBoundingClientRect().width)
    if (newWidth === 0 || newWidth === oldWidth) return

    field.width = newWidth

    // Ich verschiebe ein Hindernis außerhalb des Spielfelds mit dem rechten Rand mit.
    if (obstacle.x >= oldWidth) {
      obstacle.x += newWidth - oldWidth
    }

    draw()
  }

  // Ich beende die Runde und lasse den Charakter die verdienten XP anzeigen.
  async function finish() {
    running = false
    respawning = true
    status.textContent = 'Runde vorbei'
    document.dispatchEvent(new CustomEvent('minigame-finished', { detail: { xp: roundXp } }))

    // Ich lasse beide Bilder kurz pulsieren und ausblenden, wenn reduzierte Bewegung ausgeschaltet ist.
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const pulse = [
        { scale: '1', opacity: 1 },
        { scale: '1.18', opacity: 1 },
        { scale: '0.86', opacity: 0.4 },
        { scale: '1.1', opacity: 1 },
        { scale: '0.75', opacity: 0 }
      ]
      await Promise.all([player, obstacleImage].map(sprite =>
        sprite.animate(pulse, { duration: 420, fill: 'forwards' }).finished
      )).then(animations => {
        for (const animation of animations) animation.cancel()
      })
    }

    // Ich verstecke beide Figuren und zeige Rune nach drei Sekunden wieder an der Startposition.
    player.hidden = true
    obstacleImage.hidden = true
    setTimeout(() => {
      runner.y = ground - runner.height
      obstacle.x = field.width
      draw()
      player.hidden = false
      respawning = false
      status.textContent = 'Bereit. Tippe oder drücke die Leertaste.'
    }, 3000)
  }

  // Ich berechne Bewegung, Kollisionen und Anzeige für das nächste Bild der Runde.
  function frame(time) {
    // Ich zähle die verstrichene Spielzeit unabhängig von der Schrittweite der Bewegung.
    roundXp += recordPlayTime(previousTime, time)
    // Ich rechne die Zeit seit dem letzten Bild in Sekunden um und begrenze große Zeitsprünge.
    const dt = Math.min((time - previousTime) / 1000, 0.05)
    previousTime = time

    // Ich berechne Höhe und Fallgeschwindigkeit mit der Schwerkraft und stoppe Rune am Boden.
    const landingY = ground - runner.height
    const nextY = runner.y + velocity * dt + gravity * dt * dt / 2
    runner.y = Math.min(nextY, landingY)
    velocity = runner.y === landingY ? 0 : velocity + gravity * dt
    // Ich erhöhe das Tempo nach übersprungenen Hindernissen. Dieser Zähler dient nur der Schwierigkeit.
    obstacle.x -= Math.min(220 + passedObstacles * 14, 420) * dt

    // Ich prüfe, ob sich die Kollisionsbereiche horizontal treffen, während Rune zu tief ist.
    const collision =
      runner.x < obstacle.x + obstacle.width &&
      runner.x + runner.width > obstacle.x &&
      runner.y + runner.height > obstacle.y

    if (collision) {
      draw()
      finish()
      return
    }

    // Ich schicke das Hindernis wieder von rechts los, sobald Rune es übersprungen hat.
    if (obstacle.x + obstacle.width < runner.x) {
      passedObstacles += 1
      obstacle.x = field.width + Math.random() * 100
    }

    draw()
    requestAnimationFrame(frame)
  }

  // Ich starte den Sprung nur am Boden und berechne den Impuls für eine sichtbare Figurenhöhe.
  function jump() {
    if (running && runner.y === ground - runner.height) {
      const spriteHeight = player.getBoundingClientRect().height
      const fieldHeight = field.getBoundingClientRect().height
      const jumpHeight = ground * spriteHeight / fieldHeight
      velocity = -Math.sqrt(2 * gravity * jumpHeight)
    }
  }

  // Ich setze Positionen und die XP-Anzeige für die neue Runde zurück.
  function startRound() {
    runner.y = ground - runner.height
    obstacle.x = field.width
    obstacleImage.hidden = false
    velocity = 0
    roundXp = 0
    passedObstacles = 0
    running = true
    previousTime = performance.now()
    status.textContent = ''
    field.focus({ preventScroll: true })
    requestAnimationFrame(frame)
  }

  // Ich starte per Tipp oder Leertaste und springe mit derselben Eingabe. Nach einer Kollision warte ich, bis Rune wieder da ist.
  function play() {
    if (respawning) return
    if (running) jump()
    else startRound()
  }

  // Ich lasse Links, Bedienelemente und die Anleitung ihre eigenen Eingaben verarbeiten.
  const pageControls = 'header, .site-footer, .game-help, a, button, input, select, textarea, [contenteditable]'
  // Ich reagiere auf den Beginn einer Berührung oder einen Mausklick.
  document.addEventListener('pointerdown', event => {
    if (event.button === 0 && !event.target.closest(pageControls)) play()
  })
  // Ich prüfe beim Tastendruck, ob er eine Spielfunktion auslösen soll.
  document.addEventListener('keydown', event => {
    if (event.code !== 'Space' || event.target.closest(pageControls)) return
    event.preventDefault()
    if (!event.repeat) play()
  })

  resizeField()
  draw()
  // Ich passe die Strecke auch dann an, wenn sich die Fenstergröße während einer Runde ändert.
  new ResizeObserver(resizeField).observe(field)
})()