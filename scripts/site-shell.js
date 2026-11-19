(() => {
  // Ich verwende dieselbe Kopf- und Fußzeile auf allen Seiten.
  const base = new URL('../', document.currentScript.src).href
  const game = document.body.dataset.game
  const difficulties = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' }
  const difficultyControls = Object.entries(difficulties).map(([value, label]) => game
    ? `<button type="button" data-level="${value}" data-text="${value}" aria-pressed="false">${label}</button>`
    : `<a href="${base}pages/sudoku.html?difficulty=${value}" data-text="${value}">${label}</a>`
  ).join('')

  document.body.insertAdjacentHTML('afterbegin', `
  <header>
    <a class="brand" href="${base}pages/home.html" data-label="home" aria-label="Startseite">
      <span class="brand-icon">
        <img class="logo-light" src="${base}assets/logo-light.png" alt="">
        <img class="logo-dark" src="${base}assets/logo-dark.png" alt="">
      </span>
      <span class="brand-wordmark">brainly</span>
    </a>
    <div class="header-actions">
      <button id="menu-toggle" class="menu-toggle" type="button" aria-label="Menü öffnen"
        aria-expanded="false" aria-controls="navigation">
        <span></span>
        <span></span>
      </button>
      <!-- Hier biete ich Sprache, Farben, Schwierigkeit, Konto und den Wechsel zu den anderen Spielen an. -->
      <nav id="navigation" class="navigation" aria-label="Spieleinstellungen" data-label="settings" hidden>
        <div class="nav-group">
          <span class="nav-label" data-text="language">Sprache</span>
          <div class="languages" role="group" data-label="language">
            <button type="button" data-language="de" lang="de">Deutsch</button>
            <button type="button" data-language="en" lang="en">English</button>
          </div>
        </div>
        <div class="nav-group">
          <span class="nav-label" data-text="colors">Farbtheme</span>
          <div id="palettes" class="palettes" role="group" aria-label="Farbtheme" data-label="colors">
            <button type="button" class="theme-toggle" aria-label="Dunkelmodus einschalten" aria-pressed="false">
              <span aria-hidden="true">☾</span>
            </button>
          </div>
        </div>
        <div class="nav-group">
          <span class="nav-label" data-text="difficulty">Schwierigkeit</span>
          <div class="levels" role="group" data-label="difficulty">
            ${difficultyControls}
          </div>
        </div>
        <div class="nav-group" id="account">
          <span class="nav-label" data-text="account">Konto</span>
          <button id="account-sign-in" type="button" data-text="accountSignIn" hidden>Anmelden</button>
          <button id="account-sign-up" type="button" data-text="accountSignUp" hidden>Konto erstellen</button>
          <button id="account-profile" type="button" data-text="accountManage" hidden>Konto verwalten</button>
          <div class="languages">
            <button id="account-save" type="button" data-text="accountSave" hidden>Speichern</button>
            <button id="account-load" type="button" data-text="accountLoad" hidden>Laden</button>
            <a class="level-link" href="${base}pages/level.html">Level</a>
            <button id="account-sign-out" type="button" data-text="accountSignOut" hidden>Abmelden</button>
          </div>
          <p id="account-status" role="status"></p>
        </div>
        <div class="nav-group">
          <span class="nav-label" data-text="switchGame">Spiel wechseln</span>
          <div class="languages creator-links">
            <a href="${base}pages/home.html">brainly</a>
            <a href="${base}pages/sudoku.html">Sudoku</a>
            <a href="${base}pages/mudoku.html">Mudoku</a>
            <a href="${base}pages/wordle.html">Wordle</a>
          </div>
        </div>
        <div class="nav-group">
          <span class="nav-label" data-text="more">Mehr von ashwite</span>
          <div class="languages creator-links">
            <a href="https://gitlab.com/ashwite">GitLab</a>
            <a href="https://github.com/ashwite">GitHub</a>
          </div>
        </div>
      </nav>
    </div>
  </header>`)
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="site-footer">
    <div class="footer-links">
      <div class="footer-account" role="group" data-label="account" aria-label="Konto">
        <button id="footer-sign-in" type="button" data-text="accountSignIn" hidden>Anmelden</button>
        <button id="footer-profile" type="button" data-text="accountManage" hidden>Konto verwalten</button>
        <button id="footer-save" type="button" data-text="accountSave" hidden>Speichern</button>
        <button id="footer-load" type="button" data-text="accountLoad" hidden>Laden</button>
        <a class="level-link" href="${base}pages/level.html">Level</a>
      </div>
      <div class="levels footer-levels" role="group" data-label="difficulty">
        ${difficultyControls}
      </div>
      <nav aria-label="Hilfe und rechtliche Informationen" data-label="legal">
        <a href="${base}pages/hilfe.html" data-text="help">Hilfe</a>
        <a href="${base}pages/impressum.html" data-text="imprint">Impressum</a>
        <a href="${base}pages/datenschutz.html" data-text="privacy">Datenschutz</a>
      </nav>
    </div>
    <span id="footer-account-status" role="status"></span>
    <div class="footer-controls">
      <div class="languages footer-languages" role="group" data-label="language">
        <button type="button" data-language="en" lang="en" aria-label="English">en</button>
        <span aria-hidden="true">/</span>
        <button type="button" data-language="de" lang="de" aria-label="Deutsch">de</button>
      </div>
      <button id="theme" type="button" class="theme-toggle" aria-label="Dunkelmodus einschalten" aria-pressed="false">
        <span aria-hidden="true">☾</span>
      </button>
    </div>
  </footer>`)
})()
