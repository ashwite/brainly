// Hier steuere ich Sprache und Hell-Dunkel-Modus.
// Ich verwende das oberste HTML-Element als gemeinsame Stelle für Sprache und Hell-Dunkel-Modus.
const appearance = document.documentElement
const themeToggles = document.querySelectorAll('.theme-toggle')

// Ich verwende dieselben gespeicherten Einstellungen auf allen Spielseiten.
function saveAppearance(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Die Farben kann ich in diesem Tab auch ohne Browserspeicher ändern.
  }
}

// Ich aktualisiere das Sonnensymbol und die Farbe der Browserleiste.
function updateAppearance() {
  const dark = appearance.dataset.theme === 'dark'
  for (const button of themeToggles) {
    button.firstElementChild.textContent = dark ? '☀︎' : '☾'
    button.setAttribute('aria-label', translate(dark ? 'useLight' : 'useDark'))
    button.setAttribute('aria-pressed', String(dark))
  }
  document.querySelector('meta[name="theme-color"]').content =
    getComputedStyle(appearance).getPropertyValue('--bg').trim()
}


for (const button of themeToggles) {
  button.onclick = () => {
    appearance.dataset.theme = appearance.dataset.theme === 'dark' ? 'light' : 'dark'
    saveAppearance('sudoku-theme', appearance.dataset.theme)
    updateAppearance()
  }
}

// Ich übersetze sichtbare Texte und Screenreader-Beschriftungen, ohne Auswahlen im Spiel zu löschen.
function updateLanguage() {
  for (const element of document.querySelectorAll('[data-text]')) {
    // Ich lese den Übersetzungsschlüssel aus data-text und setze den sichtbaren Text in der gewählten Sprache ein.
    element.textContent = translate(element.dataset.text)
  }
  for (const element of document.querySelectorAll('[data-label]')) {
    element.setAttribute('aria-label', translate(element.dataset.label))
  }
  for (const button of document.querySelectorAll('[data-language]')) {
    button.setAttribute('aria-pressed', String(button.dataset.language === appearance.lang))
  }
  updateAppearance()
  // Ich sende den Spielen ein Signal, damit sie ihre selbst erzeugten Texte ebenfalls neu anzeigen.
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
