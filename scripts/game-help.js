// Ich steuere die Spielanleitung, die über das kleine i in der Kopfzeile erreichbar ist.
(() => {
  // Ich greife auf das Element game-help-toggle zu, damit ich es im weiteren Ablauf verwenden kann.
  const button = document.querySelector('#game-help-toggle')
  // Ich lese am Button, zu welchem Abschnitt er gehört. aria-controls verweist auf die Kennung des passenden Abschnitts.
  const panel = document.getElementById(button.getAttribute('aria-controls'))
  let closeTimer

  // Ich ändere gleichzeitig die Sichtbarkeit und den Zustand, den Screenreader am Button vorlesen.
  function showHelp(open) {
    panel.hidden = !open
    button.setAttribute('aria-expanded', String(open))
  }

  button.addEventListener('click', () => {
    // Ich stoppe bei jedem Klick den laufenden Countdown. Beim Öffnen starte ich einen neuen Countdown von sieben Sekunden.
    clearTimeout(closeTimer)
    const open = panel.hidden
    showHelp(open)
    if (open) closeTimer = setTimeout(() => showHelp(false), 7000)
  })
})()
