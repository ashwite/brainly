(() => {
  const buttons = document.querySelectorAll('.home-info')
  let closeTimer

  function showHelp(selected) {
    for (const button of buttons) {
      const expanded = button === selected
      document.getElementById(button.getAttribute('aria-controls')).hidden = !expanded
      button.setAttribute('aria-expanded', String(expanded))
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      clearTimeout(closeTimer)
      const open = button.getAttribute('aria-expanded') === 'false'
      showHelp(open ? button : null)
      if (open) closeTimer = setTimeout(() => showHelp(null), 7000)
    })
  }
})()
