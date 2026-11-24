(() => {
  // Ich hole das Canvas und die Statusanzeige aus der Seite.
  const field = document.querySelector('#field')
  const ctx = field.getContext('2d')
  // Ich greife auf das Element status zu, damit ich es im weiteren Ablauf verwenden kann.
  const status = document.querySelector('#status')

  // Ich speichere die Korbposition, die fallenden Motive und die gedrückten Pfeiltasten.
  const basket = { x: 184, y: 214, width: 112, height: 14 }
  let basketImage
  const defaultFieldHeight = field.height
  const drops = []
  const motifNames = ['pumpkin', 'carrot', 'honey', 'zombie', 'leek', 'cucumber']
  const motifs = []
  // Ich merke mir, welche Motive im laufenden Durchgang noch nicht gezogen wurden.
  let remainingMotifs = []
  // Ich halte die gerade gedrückten Pfeiltasten fest.
  const pressed = new Set()
  // Ich merke mir die XP dieser Runde für die Meldung am Spielende.
  let roundXp = 0
  // Ich zähle Fehlversuche in Folge und setze die Serie bei einem Fang zurück.
  let consecutiveMisses = 0
  // Ich merke mir, ob gerade eine Runde läuft und Eingaben annehmen darf.
  let running = false
  // Ich halte den festen Endzeitpunkt für den Countdown fest.
  let endTime = 0
  // Ich speichere die Zeit des vorigen Bilds für Bewegung und XP.
  let previousTime = 0
  // Ich sammle XP nur während laufender Runden und bei sichtbarem Tab.
  const recordPlayTime = levelProgress.trackPlayTime('spark')
  // Ich merke mir, wann das nächste Motiv von oben erscheint.
  let nextDrop = 0
  // Ich speichere Treffpunkt und Animationsfortschritt bei der Zombie-Kollision.
  let impact = null

  // Ich erstelle aus der PNG-Transparenz eine weiße Variante für den Dunkelmodus.
  async function loadMotif(name, size = 50) {
    const light = new Image()
    light.src = new URL(`../assets/spark-${name}.png`, document.currentScript.src).href
    await light.decode()

    const scale = size / Math.max(light.naturalWidth, light.naturalHeight)
    const width = light.naturalWidth * scale
    const height = light.naturalHeight * scale
    const dark = document.createElement('canvas')
    dark.width = light.naturalWidth
    dark.height = light.naturalHeight
    const darkContext = dark.getContext('2d')
    darkContext.drawImage(light, 0, 0)
    darkContext.globalCompositeOperation = 'source-in'
    darkContext.fillStyle = '#fff'
    darkContext.fillRect(0, 0, dark.width, dark.height)
    return { light, dark, width, height, isZombie: name === 'zombie' }
  }

  // Ich ziehe jedes Motiv einmal in zufälliger Reihenfolge und fülle die Auswahl danach wieder auf.
  function spawnDrop() {
    if (remainingMotifs.length === 0) remainingMotifs = [...motifs]
    const index = Math.floor(Math.random() * remainingMotifs.length)
    const [motif] = remainingMotifs.splice(index, 1)
    const x = Math.random() * Math.max(0, field.width - motif.width)
    drops.push({ ...motif, x, y: -motif.height })
  }

  // Ich begrenze die Position so, dass der ganze Korb im Spielfeld bleibt.
  function moveBasket(x) {
    basket.x = Math.max(0, Math.min(x, field.width - basket.width))
  }

  // Ich zeichne die Hasengruppe und die fallenden Motive in der Farbe des aktuellen Modus.
  function draw() {
    ctx.clearRect(0, 0, field.width, field.height)
    const appearance = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
    if (impact) {
      drawImpact(appearance)
      return
    }
    if (basketImage) {
      ctx.drawImage(basketImage[appearance], basket.x, basket.y, basket.width, basket.height)
    }
    for (const drop of drops) {
      ctx.drawImage(drop[appearance], drop.x, drop.y, drop.width, drop.height)
    }
  }

  // Ich lasse beide Figuren am Treffpunkt kurz aufblinken und zeichne kleine Funken nach außen.
  function drawImpact(appearance) {
    const { zombie, progress, offset } = impact
    if (progress >= 1) return

    const scale = 1 + 0.22 * Math.sin(progress * Math.PI * 2)
    const x = basket.x + offset
    const y = basket.y
    ctx.save()
    ctx.globalAlpha = 1 - progress
    ctx.drawImage(basketImage[appearance],
      basket.x + basket.width * (1 - scale) / 2, y + basket.height * (1 - scale),
      basket.width * scale, basket.height * scale)
    ctx.drawImage(zombie[appearance], x - zombie.width * scale / 2, y - zombie.height * scale,
      zombie.width * scale, zombie.height * scale)

    ctx.fillStyle = appearance === 'dark' ? '#fff' : '#000'
    const radius = 8 + progress * 36
    for (let index = 0; index < 8; index += 1) {
      const angle = index * Math.PI / 4
      ctx.fillRect(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 3, 3)
    }
    ctx.restore()
  }

  // Ich übernehme die sichtbare Spielfeldgröße und passe die Positionen der fallenden Motive an.
  function resizeField() {
    const bounds = field.getBoundingClientRect()
    const width = Math.round(bounds.width)
    const height = Math.round(bounds.height)
    if (!width || !height || (width === field.width && height === field.height)) return

    const horizontalScale = width / field.width
    const verticalScale = height / field.height
    const basketCenter = (basket.x + basket.width / 2) * horizontalScale
    field.width = width
    field.height = height
    for (const drop of drops) {
      drop.x = Math.min(drop.x * horizontalScale, Math.max(0, width - drop.width))
      drop.y *= verticalScale
    }
    moveBasket(basketCenter - basket.width / 2)
    basket.y = height - basket.height - 12
    draw()
  }

  // Ich beende die Runde und lasse den Charakter die verdienten XP anzeigen.
  function finish(reason) {
    running = false
    pressed.clear()
    status.textContent = reason
    document.dispatchEvent(new CustomEvent('minigame-finished', { detail: { xp: roundXp } }))
    status.classList.add('sr-only')
  }

  // Ich stoppe bei der Kollision die Spielzeit und zeige die XP nach der kurzen Animation.
  function hitZombie(zombie) {
    running = false
    const reason = document.documentElement.lang === 'en' ? 'Zombie hit!' : 'Zombie berührt!'
    status.classList.add('sr-only')
    status.textContent = reason
    // Ich halte den Treffpunkt relativ zur Hasengruppe fest und zeichne von dort die Funken.
    const offset = Math.max(0, Math.min(basket.width, zombie.x + zombie.width / 2 - basket.x))
    impact = { zombie, offset, progress: 0 }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      impact.progress = 1
      draw()
      finish(reason)
      return
    }

    const started = performance.now()
    // Ich zeichne jeweils einen Animationsschritt und gebe danach den Neustart frei.
    function animate(time) {
      impact.progress = Math.min(1, Math.max(0, (time - started) / 420))
      draw()
      if (impact.progress < 1) {
        requestAnimationFrame(animate)
      } else {
        finish(reason)
      }
    }
    requestAnimationFrame(animate)
  }

  // Ich berechne Bewegung, Kollisionen und Anzeige für das nächste Bild der Runde.
  function frame(time) {
    // Ich zähle die verstrichene Spielzeit unabhängig von der Schrittweite der Bewegung.
    roundXp += recordPlayTime(previousTime, Math.min(time, endTime))
    // Ich berechne den Countdown aus dem festen Endzeitpunkt und stoppe die Runde bei null.
    const seconds = Math.max(0, Math.ceil((endTime - time) / 1000))
    if (seconds === 0) {
      finish('Zeit vorbei')
      return
    }

    // Ich rechne die Bewegung pro Bild aus der verstrichenen Zeit.
    const dt = Math.min((time - previousTime) / 1000, 0.05)
    previousTime = time

    if (pressed.has('ArrowLeft')) moveBasket(basket.x - 300 * dt)
    if (pressed.has('ArrowRight')) moveBasket(basket.x + 300 * dt)

    // Ich lasse jedes Motiv an einer zufälligen waagerechten Position starten.
    if (time >= nextDrop) {
      spawnDrop()
      nextDrop = time + 500 + seconds * 10
    }

    // Ich passe die Fallgeschwindigkeit an die Spielfeldhöhe an und werte die Motive in Fallreihenfolge aus.
    const fallDistance = (170 - seconds * 2) * dt * field.height / defaultFieldHeight
    for (let index = 0; index < drops.length;) {
      const drop = drops[index]
      drop.y += fallDistance

      // Ich vergleiche die Bildgrenzen des Motivs mit dem Fangbereich der Hasengruppe.
      const caught =
        drop.y + drop.height >= basket.y &&
        drop.y <= basket.y + basket.height &&
        drop.x + drop.width >= basket.x &&
        drop.x <= basket.x + basket.width

      const missed = drop.y > basket.y + basket.height
      if (!caught && !missed) {
        index += 1
        continue
      }

      drops.splice(index, 1)
      // Ich behandle den Zombie als Hindernis. Beim Ausweichen lasse ich die Fehlserie unverändert.
      if (drop.isZombie) {
        if (caught) {
          hitZombie(drop)
          return
        }
        continue
      }

      // Ich zähle ein Motiv als verpasst, sobald es unter dem Korb liegt. Ein Fang setzt die Serie zurück.
      consecutiveMisses = caught ? 0 : consecutiveMisses + 1
      if (consecutiveMisses === 3) {
        draw()
        finish(document.documentElement.lang === 'en'
          ? 'Three missed in a row'
          : 'Drei Motive in Folge verpasst')
        return
      }
    }

    // Ich aktualisiere den sichtbaren Countdown nur, wenn sich die angezeigte Zeit ändert.
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

  // Ich reagiere auf den Beginn einer Berührung oder einen Mausklick.
  field.addEventListener('pointerdown', followPointer)
  // Ich verarbeite die Bewegung von Finger oder Maus über dem Spielfeld.
  field.addEventListener('pointermove', followPointer)

  // Ich merke mir gehaltene Pfeiltasten und entferne sie beim Loslassen oder beim Verlust des Spielfeldfokus.
  field.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      pressed.add(event.key)
    }
  })

  // Ich beende die Eingabe beim Loslassen der Taste.
  field.addEventListener('keyup', event => pressed.delete(event.key))
  // Ich setze die gehaltenen Eingaben zurück, wenn das Element den Fokus verliert.
  field.addEventListener('blur', () => pressed.clear())

  // Ich beginne erst nach dem Laden der Bilder und lasse die Kollisionsanimation auslaufen. Für die neue Runde setze ich Motive, Fehlserie, XP-Zähler und Countdown zurück.
  function startRound() {
    if (running || !basketImage || motifs.length === 0 || (impact && impact.progress < 1)) return
    drops.length = 0
    impact = null
    remainingMotifs = []
    pressed.clear()
    moveBasket((field.width - basket.width) / 2)
    roundXp = 0
    consecutiveMisses = 0
    running = true
    previousTime = performance.now()
    endTime = previousTime + 30000
    nextDrop = previousTime
    status.textContent = 'Zeit: 30 s'
    status.classList.remove('sr-only')
    field.focus({ preventScroll: true })
    requestAnimationFrame(frame)
  }

  // Ich starte per Tipp oder Leertaste und lasse Navigation und Anleitung ihre Eingaben selbst verarbeiten.
  const pageControls = 'header, .site-footer, .game-help, a, button, input, select, textarea, [contenteditable]'
  // Ich reagiere auf den Beginn einer Berührung oder einen Mausklick.
  document.addEventListener('pointerdown', event => {
    if (!running && event.button === 0 && !event.target.closest(pageControls)) {
      startRound()
      if (event.target === field) followPointer(event)
    }
  })
  // Ich prüfe beim Tastendruck, ob er eine Spielfunktion auslösen soll.
  document.addEventListener('keydown', event => {
    if (event.code !== 'Space' || event.target.closest(pageControls)) return
    event.preventDefault()
    if (!event.repeat) startRound()
  })

  resizeField()
  draw()
  new ResizeObserver(resizeField).observe(field)
  // Ich zeichne beim Umschalten auch dann neu, wenn gerade keine Runde läuft.
  new MutationObserver(draw).observe(document.documentElement, { attributeFilter: ['data-theme'] })

  // Ich lade die Bilder vor dem Rundenstart und verwende alle erfolgreich geladenen Motive.
  Promise.allSettled([
    loadMotif('basket', basket.width),
    ...motifNames.map(name => loadMotif(name))
  ]).then(([basketResult, ...results]) => {
    for (const result of results) {
      if (result.status === 'fulfilled') motifs.push(result.value)
    }
    if (basketResult.status !== 'fulfilled' || motifs.length === 0) {
      status.classList.remove('sr-only')
      status.textContent = document.documentElement.lang === 'en'
        ? 'The images could not be loaded.'
        : 'Die Motive konnten nicht geladen werden.'
      return
    }
    // Ich übernehme die Bildhöhe in den Fangbereich und halte die Hasen über der unteren Linie.
    basketImage = basketResult.value
    basket.height = basketImage.height
    basket.y = field.height - basket.height - 12
    draw()
  })
})()