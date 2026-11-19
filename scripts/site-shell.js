(() => {
  // Ich verwende dieselbe Kopf- und Fußzeile auf allen Seiten.
  const base = new URL('../', document.currentScript.src).href
  document.body.insertAdjacentHTML('afterbegin', `
  <header>
    <a class="brand" href="${base}pages/home.html" data-label="home" aria-label="Startseite">
      <span class="brand-icon">
        <img class="logo-light" src="${base}assets/logo-light.png" alt="">
        <img class="logo-dark" src="${base}assets/logo-dark.png" alt="">
      </span>
      <span class="brand-wordmark">brainly</span>
    </a>
    <button id="theme" type="button" class="theme-toggle" aria-label="Dunkelmodus einschalten" aria-pressed="false">
      <span aria-hidden="true">☾</span>
    </button>
  </header>`)
  document.body.insertAdjacentHTML('beforeend', `
  <div class="footer-skate" aria-hidden="true"></div>
  <footer class="site-footer">
    <div class="footer-links">
      <a href="${base}pages/home.html" data-label="home">Home</a>
      <div class="footer-account" role="group" data-label="account" aria-label="Konto">
        ${document.getElementById('account-session') ? '' : '<button id="account-session" type="button" data-text="accountSignIn" hidden>Anmelden</button>'}
        <button id="footer-profile" type="button" data-text="accountManage" hidden>Konto verwalten</button>
      </div>
      <nav aria-label="Rechtliche Informationen" data-label="legal">
        <span data-text="imprint">Impressum</span>
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
    </div>
  </footer>`)
})()
