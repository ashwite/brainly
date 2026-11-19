(() => {
  const button = document.querySelector('#game-help-toggle')
  const panel = document.getElementById(button.getAttribute('aria-controls'))
  let closeTimer

  function showHelp(open) {
    panel.hidden = !open
    button.setAttribute('aria-expanded', String(open))
  }

  button.addEventListener('click', () => {
    clearTimeout(closeTimer)
    const open = panel.hidden
    showHelp(open)
    if (open) closeTimer = setTimeout(() => showHelp(false), 7000)
  })
})()
