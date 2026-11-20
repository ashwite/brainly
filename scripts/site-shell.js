// Ich baue die gemeinsame Kopf- und Fußzeile einmal für alle Seiten. So kann ich Links und Bedienelemente an einer Stelle ändern.
(() => {
  // Ich verwende dieselbe Kopf- und Fußzeile auf allen Seiten.
  // Ich leite die Projektadresse aus der Adresse dieses Skripts ab. So funktionieren die Links auch in einem Unterordner.
  const base = new URL('../', document.currentScript.src).href
  const games = { sudoku: 'Sudoku', mudoku: 'Mudoku', wordle: 'Wordle' }
  // Ich lese aus dem Seitenkörper, ob ein Spiel geöffnet ist. Nur dann füge ich das i zur Anleitung hinzu.
  const game = document.body.dataset.game
  const gameName = games[game]
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="background-butterflies" aria-hidden="true"></div>
  <div class="background-motif-center" aria-hidden="true"></div>
  <header>
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
  </header>`)
  // Ich ergänze unten die animierte Figur, die Footer-Links und die Zeile für Konto-Meldungen.
  document.body.insertAdjacentHTML('beforeend', `
  <div class="footer-area">
    <div class="footer-skate" aria-hidden="true"></div>
    <footer class="site-footer">
      <nav class="footer-links" aria-label="Fußnavigation" data-label="footerNavigation">
        <div class="footer-games">
          <a href="${base}pages/home.html" data-label="home">Home</a>
          ${Object.entries(games).map(([slug, name]) => `<a href="${base}pages/${slug}.html">${name}</a>`).join(' ')}
        </div>
        <div class="footer-meta">
          ${document.getElementById('account-session') ? '' : '<button id="account-session" type="button" data-text="accountSignIn" hidden>Anmelden</button>'}
          <button id="footer-profile" type="button" data-text="accountManage" hidden>Konto verwalten</button>
          <span data-text="imprint">Impressum</span>
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
})()
