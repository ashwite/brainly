// Ich erstelle ein teilbares PNG mit Charakter, Name, Level und XP.
(() => {
  // Ich greife auf das Element level-share zu, damit ich es im weiteren Ablauf verwenden kann.
  const button = document.querySelector('#level-share')
  // Ich greife auf das Element level-share-status zu, damit ich es im weiteren Ablauf verwenden kann.
  const status = document.querySelector('#level-share-status')
  // Ich greife auf das Element level-character zu, damit ich es im weiteren Ablauf verwenden kann.
  const portrait = document.querySelector('#level-character')
  // Ich greife auf das Element level-title zu, damit ich es im weiteren Ablauf verwenden kann.
  const title = document.querySelector('#level-title')
  // Ich greife auf das Element level-name zu, damit ich es im weiteren Ablauf verwenden kann.
  const nameInput = document.querySelector('#level-name')
  let statusKey = ''

  // Ich übernehme die Rückmeldung aus der aktuellen Spiel- oder Kontofunktion in die Statusanzeige.
  function showStatus(key) {
    statusKey = key
    status.textContent = key ? translate(key) : ''
  }

  async function createLevelImage() {
    await portrait.decode()
    // Ich zeichne das Bild auf einer unsichtbaren Fläche. canvas ist die Fläche selbst, context enthält die Zeichenbefehle.
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 800
    const context = canvas.getContext('2d')
    const theme = getComputedStyle(document.documentElement)
    const font = getComputedStyle(title).fontFamily

    context.fillStyle = theme.getPropertyValue('--bg').trim()
    context.fillRect(0, 0, 800, 800)

    // Ich passe das Charakterbild proportional in den vorgesehenen Bereich ein.
    const scale = 480 / Math.max(portrait.naturalWidth, portrait.naturalHeight)
    const width = portrait.naturalWidth * scale
    const height = portrait.naturalHeight * scale
    context.drawImage(portrait, (800 - width) / 2, 100 + (480 - height) / 2, width, height)

    context.fillStyle = theme.getPropertyValue('--ink').trim()
    context.textAlign = 'center'
    const name = nameInput.value.trim()
    if (name) {
      context.font = `34px ${font}`
      context.fillText(name, 400, 624, 700)
    }
    context.font = `52px ${font}`
    context.fillText(title.textContent, 400, name ? 685 : 650, 700)
    context.font = `26px ${font}`
    context.fillText('brainly', 400, name ? 735 : 704)

    // Ich warte, bis der Browser die Zeichenfläche in eine PNG-Datei umgewandelt hat.
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG export failed')), 'image/png')
    })
  }

  // Ich erstelle kurzzeitig eine Adresse für die Datei und verwende sie für den Download.
  function download(file) {
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 30000)
  }

  // Ich aktualisiere die sprachabhängige Darstellung beim Wechsel der Seitensprache.
  document.addEventListener('game-language-change', () => showStatus(statusKey))
  button.addEventListener('click', async () => {
    if (portrait.hidden) {
      showStatus('shareImageMissing')
      return
    }

    // Ich sperre den Button während der Erstellung. Danach versuche ich, das Teilen-Menü zu öffnen.
    button.disabled = true
    showStatus('')
    try {
      const blob = await createLevelImage()
      const file = new File([blob], 'brainly-level.png', { type: 'image/png' })
      const shareData = { files: [file] }
      try {
        if (navigator.share && navigator.canShare?.(shareData)) {
          await navigator.share(shareData)
          return
        }
      } catch (error) {
        if (error.name === 'AbortError') return
        // Wenn das Teilen fehlschlägt, biete ich die Datei zum Herunterladen an.
      }
      download(file)
      showStatus('shareDownloaded')
    } catch {
      showStatus(window.location.protocol === 'file:' ? 'shareLocalFile' : 'shareFailed')
    } finally {
      button.disabled = false
    }
  })
})()
