// Hier steuere ich das gemeinsame Menü sowie Sprache und Farben.
const appearance = document.documentElement
const menuToggle = document.querySelector('#menu-toggle')
const menu = document.querySelector('#navigation')
const paletteGroup = document.querySelector('#palettes')
const themeToggles = document.querySelectorAll('.theme-toggle')

const PALETTES = [
  { id: 'mono', name: 'Schwarz & Weiß' },
  { id: 'garden', name: 'Grün & Pink' },
  { id: 'rose', name: 'Rot & Pink' },
  { id: 'pink', name: 'Hellpink & Dunkelpink' },
  { id: 'blue', name: 'Hellblau & Dunkelblau' },
  { id: 'green', name: 'Hellgrün & Dunkelgrün' },
  { id: 'lavender', name: 'Lavendel' },
  { id: 'sunshine', name: 'Orange & Gelb' },
  { id: 'sand', name: 'Braun & Beige' },
];

// Ich verwende dieselben gespeicherten Einstellungen auf allen Spielseiten.
function saveAppearance(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Die Farben kann ich in diesem Tab auch ohne Browserspeicher ändern.
  }
}

// Ich aktualisiere das Sonnensymbol, die Markierung der gewählten Palette und die Farbe der Browserleiste.
function updateAppearance() {
  const dark = appearance.dataset.theme === 'dark'
  for (const button of themeToggles) {
    button.firstElementChild.textContent = dark ? '☀︎' : '☾'
    button.setAttribute('aria-label', translate(dark ? 'useLight' : 'useDark'))
    button.setAttribute('aria-pressed', String(dark))
  }
  for (const button of paletteGroup.querySelectorAll('[data-palette-choice]')) {
    button.setAttribute('aria-pressed', String(button.dataset.paletteChoice === appearance.dataset.palette))
  }
  document.querySelector('meta[name="theme-color"]').content =
    getComputedStyle(appearance).getPropertyValue('--bg').trim()
}

const currentPalette = PALETTES.find(palette => palette.id === appearance.dataset.palette)?.id || 'mono'
for (const palette of PALETTES) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'palette-choice'
  button.dataset.paletteChoice = palette.id
  button.title = palette.name
  button.setAttribute('aria-label', palette.name)

  // Ich lese die echten Sudoku-Farben aus dem Stylesheet, damit sie auch in der Vorschau übereinstimmen.
  appearance.dataset.palette = palette.id
  const colors = getComputedStyle(appearance)
  const swatch = document.createElement('span')
  swatch.className = 'palette-swatch'
  swatch.setAttribute('aria-hidden', 'true')
  swatch.style.setProperty('--swatch-light', colors.getPropertyValue('--palette-light').trim())
  swatch.style.setProperty('--swatch-dark', colors.getPropertyValue('--palette-dark').trim())
  button.append(swatch)
  button.onclick = () => {
    appearance.dataset.palette = palette.id
    saveAppearance('sudoku-palette', palette.id)
    updateAppearance()
  }
  paletteGroup.append(button)
}
appearance.dataset.palette = currentPalette
updateAppearance()

for (const button of themeToggles) {
  button.onclick = () => {
    appearance.dataset.theme = appearance.dataset.theme === 'dark' ? 'light' : 'dark'
    saveAppearance('sudoku-theme', appearance.dataset.theme)
    updateAppearance()
  }
}

// Ich ändere die Sichtbarkeit und sage auch dem Screenreader, ob das Menü auf oder zu ist.
function setMenu(open) {
  menu.hidden = !open
  menuToggle.setAttribute('aria-expanded', String(open))
  menuToggle.setAttribute('aria-label', translate(open ? 'closeMenu' : 'openMenu'))
}
menuToggle.onclick = () => setMenu(menu.hidden)
document.addEventListener('click', event => {
  if (!event.target.closest('.header-actions')) setMenu(false)
})
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) {
    setMenu(false)
    menuToggle.focus()
  }
})

// Ich übersetze sichtbare Texte und Screenreader-Beschriftungen, ohne Auswahlen im Spiel zu löschen.
function updateLanguage() {
  for (const element of document.querySelectorAll('[data-text]')) {
    element.textContent = translate(element.dataset.text)
  }
  for (const element of document.querySelectorAll('[data-label]')) {
    element.setAttribute('aria-label', translate(element.dataset.label))
  }
  for (const button of document.querySelectorAll('[data-language]')) {
    button.setAttribute('aria-pressed', String(button.dataset.language === appearance.lang))
  }
  paletteGroup.querySelectorAll('[data-palette-choice]').forEach((button, index) => {
    button.title = translate('paletteNames')[index]
    button.setAttribute('aria-label', button.title)
  })
  updateAppearance()
  setMenu(!menu.hidden)
  document.dispatchEvent(new Event('game-language-change'))
}

for (const button of document.querySelectorAll('[data-language]')) {
  button.onclick = () => {
    appearance.lang = button.dataset.language
    saveAppearance('sudoku-language', appearance.lang)
    updateLanguage()
  }
}
updateLanguage()
