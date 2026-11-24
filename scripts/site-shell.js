// Ich baue die gemeinsame Kopf- und Fußzeile einmal für alle Seiten. So kann ich Links und Bedienelemente an einer Stelle ändern.
(() => {
  // Ich verwende dieselbe Kopf- und Fußzeile auf allen Seiten.
  // Ich leite die Projektadresse aus der Adresse dieses Skripts ab. So funktionieren die Links auch in einem Unterordner.
  const base = new URL('../', document.currentScript.src).href
  // Ich verwende dieselbe Spielreihenfolge oben und in der Fußnavigation.
  const games = { puff: 'Puff', sudoku: 'Sudoku', rune: 'Rune', mudoku: 'Mudoku', spark: 'Spark', wordle: 'Wordle' }
  // Ich lese aus dem Seitenkörper, ob ein Spiel geöffnet ist. Nur dann füge ich das i zur Anleitung hinzu.
  const game = document.body.dataset.game
  const gameName = games[game]
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="background-butterflies" aria-hidden="true"></div>
  <div class="background-motif-center" aria-hidden="true"></div>
  <header>
      <div class="header-top">
    <a class="brand" href="${base}pages/home.html" data-label="home" aria-label="Startseite">
      <span class="brand-icon">
        <img class="logo-light" src="${base}assets/logo-light.png" alt="">
        <img class="logo-dark" src="${base}assets/logo-dark.png" alt="">
      </span>
      <span class="brand-wordmark">brainly</span>
    </a>
    <div class="header-controls">
      ${gameName ? `<button id="game-help-toggle" type="button" aria-expanded="false" aria-controls="hilfe-${game}"
        data-label="help${gameName}" aria-label="Anleitung zu ${gameName}">i</button>` : ''}
      <button id="theme" type="button" class="theme-toggle" aria-label="Dunkelmodus einschalten" aria-pressed="false">
        <span aria-hidden="true">☾</span>
      </button>
    </div>
        </div>
          <nav class="header-games" aria-label="Spielnavigation">
      ${Object.entries({ home: 'Home', ...games }).map(([slug, name]) => `
        <a class="header-game-link" href="${base}pages/${slug}.html">
          <span class="header-game-image">
            <img src="${base}assets/nav-${slug}.png${slug === 'puff' || slug === 'mudoku' ? '?v=2' : ''}" alt="">
          </span>
          <span>${name}</span>
        </a>
      `).join('')}
    </nav>
  </header>`)
  // Ich lasse Miffyroll im Impressum und bei den beiden Spielfeldern über dem Footer weg.
  const showMiffyroll = !['spark', 'puff'].includes(game) && document.body.dataset.page !== 'impressum'
  document.body.insertAdjacentHTML('beforeend', `
  <div class="footer-area">
    ${showMiffyroll ? '<div class="footer-skate" aria-hidden="true"></div>' : ''}
    <footer class="site-footer">
      <nav class="footer-links" aria-label="Fußnavigation" data-label="footerNavigation">
        <div class="footer-games">
          <a href="${base}pages/home.html" data-label="home">Home</a>
          ${Object.entries(games).map(([slug, name]) => `<a href="${base}pages/${slug}.html">${name}</a>`).join(' ')}
        </div>
        <div class="footer-meta">
          ${document.getElementById('account-session') ? '' : '<button id="account-session" type="button" data-text="accountSignIn" hidden>Anmelden</button>'}
          <button id="footer-profile" type="button" data-text="accountManage" hidden>Konto verwalten</button>
          <a href="${base}pages/impressum.html" data-text="imprint">Impressum</a>
          <a href="${base}pages/datenschutz.html" data-text="privacy">Datenschutz</a>
          <div class="languages footer-languages" role="group" data-label="language">
            <button type="button" data-language="en" lang="en" aria-label="English">en</button>
            <span aria-hidden="true">/</span>
            <button type="button" data-language="de" lang="de" aria-label="Deutsch">de</button>
          </div>
        </div>
      </nav>
      <span id="footer-account-status" role="status"></span>
    </footer>
  </div>`)

  const runeTrack = document.querySelector('.rune-track')
  // Ich setze die Rune-Strecke genau an die Stelle der Footer-Animation.
  if (game === 'rune' && runeTrack) {
    document.querySelector('.footer-skate').replaceWith(runeTrack)
  }

  // Ich überspringe Bedienelemente, Spielfelder und per Tastatur ausgelöste Klicks.
  const interactive = 'a, button, input, select, textarea, label, summary, canvas, [contenteditable], [tabindex], [role="button"], [role="link"], [role="switch"]'
  document.addEventListener('click', event => {
    if (!event.detail || event.defaultPrevented || event.target.closest(interactive)) return
    // Bei Rune und Spark halte ich die freie Spielfläche für den Rundenstart oder Sprung frei.
    if (['rune', 'spark'].includes(game) && !event.target.closest('header, .site-footer, .game-help')) return

    // Ich lasse jeden Stern an seiner eigenen Klickposition drei Sekunden lang sichtbar.
    const star = document.createElement('span')
    star.className = 'click-star'
    star.setAttribute('aria-hidden', 'true')
    star.style.left = event.clientX + 'px'
    star.style.top = event.clientY + 'px'
    document.body.append(star)
    window.setTimeout(() => star.remove(), 3000)
  })
})()
