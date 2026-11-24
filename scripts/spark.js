(() => {
  // Ich hole das Canvas, die Statusanzeige und den Startknopf aus der Seite.
  const field = document.querySelector('#field')
  const ctx = field.getContext('2d')
  const status = document.querySelector('#status')
  const startButton = document.querySelector('#start')

  // Ich speichere die Korbposition, die aktiven Sterne und die gedrückten Pfeiltasten.
  const basket = { x: 204, y: 214, width: 72, height: 14 }
  const stars = []
  const pressed = new Set()
  let roundXp = 0
  let running = false
  let endTime = 0
  let previousTime = 0
  // Ich sammle Zeit nur aus laufenden Runden. Startbildschirm und Rundenpausen bleiben außen vor.
  const recordPlayTime = levelProgress.trackPlayTime('spark')
  let nextStar = 0

  // Ich begrenze die Position so, dass der ganze Korb im Spielfeld bleibt.
  function moveBasket(x) {
    basket.x = Math.max(0, Math.min(x, field.width - basket.width))
  }

  // Ich lösche das vorige Bild und zeichne den Korb und alle aktiven Sterne neu.
  function draw() {
    ctx.clearRect(0, 0, field.width, field.height)
    ctx.fillStyle = '#a8e0ff'
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height)
    ctx.fillStyle = '#ffdb72'
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const star of stars) {
      ctx.fillText('★', star.x, star.y)
    }
  }

  function frame(time) {
    // Ich zähle die verstrichene Spielzeit unabhängig von der Schrittweite der Bewegung.
    roundXp += recordPlayTime(previousTime, Math.min(time, endTime))
    // Ich berechne den Countdown aus dem festen Endzeitpunkt und stoppe die Runde bei null.
    const seconds = Math.max(0, Math.ceil((endTime - time) / 1000))
    if (seconds === 0) {
      running = false
      pressed.clear()
      status.textContent = 'Zeit vorbei'
      // Ich lasse den Charakter nach Ablauf der Zeit die verdienten XP anzeigen.
      document.dispatchEvent(new CustomEvent('minigame-finished', { detail: { xp: roundXp } }))
      startButton.disabled = false
      startButton.textContent = 'Nochmal'
      return
    }

    // Ich rechne die Bewegung pro Bild aus der verstrichenen Zeit.
    const dt = Math.min((time - previousTime) / 1000, 0.05)
    previousTime = time

    if (pressed.has('ArrowLeft')) moveBasket(basket.x - 300 * dt)
    if (pressed.has('ArrowRight')) moveBasket(basket.x + 300 * dt)

    // Ich lasse Sterne an zufälligen X-Positionen erscheinen und verkürze nach und nach die Abstände.
    if (time >= nextStar) {
      stars.push({ x: 12 + Math.random() * (field.width - 24), y: -12 })
      nextStar = time + 500 + seconds * 10
    }

    // Ich gehe die Sterne rückwärts durch, damit ich gefangene und verpasste Sterne direkt löschen kann.
    for (let index = stars.length - 1; index >= 0; index -= 1) {
      const star = stars[index]
      star.y += (170 - seconds * 2) * dt

      // Ich prüfe, ob der Bereich um die Sternmitte den Korb in beiden Richtungen überschneidet.
      const caught =
        star.y + 10 >= basket.y &&
        star.y - 10 <= basket.y + basket.height &&
        star.x + 10 >= basket.x &&
        star.x - 10 <= basket.x + basket.width

      if (caught || star.y > field.height + 12) {
        stars.splice(index, 1)
      }
    }

    // Ich ändere die Anzeige nur, wenn eine weitere Sekunde vergangen ist.
    const countdown = `Zeit: ${seconds} s`
    if (status.textContent !== countdown) status.textContent = countdown
    draw()
    requestAnimationFrame(frame)
  }

  // Ich rechne die Maus- oder Fingerposition in Canvas-Koordinaten um und zentriere den Korb darunter.
  function followPointer(event) {
    if (!running) return
    const bounds = field.getBoundingClientRect()
    const x = (event.clientX - bounds.left) * field.width / bounds.width
    moveBasket(x - basket.width / 2)
  }

  field.addEventListener('pointerdown', followPointer)
  field.addEventListener('pointermove', followPointer)

  // Ich merke mir gehaltene Pfeiltasten und entferne sie beim Loslassen oder beim Verlust des Spielfeldfokus.
  field.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      pressed.add(event.key)
    }
  })

  field.addEventListener('keyup', event => pressed.delete(event.key))
  field.addEventListener('blur', () => pressed.clear())

  // Ich räume die alte Runde auf, zentriere den Korb und starte den Countdown von 30 Sekunden.
  startButton.addEventListener('click', () => {
    stars.length = 0
    pressed.clear()
    moveBasket((field.width - basket.width) / 2)
    roundXp = 0
    running = true
    previousTime = performance.now()
    endTime = previousTime + 30000
    nextStar = previousTime
    field.focus()
    startButton.disabled = true
    requestAnimationFrame(frame)
  })

  draw()
})()