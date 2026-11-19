// Ich verwende dieselbe Anmeldung für alle Spiele und speichere ihre Online-Spielstände getrennt.
// Hier kümmere ich mich um Anmeldung, Konto und Online-Spielstände.
// Die äußere Funktion starte ich sofort. Ihre Variablen bleiben in dieser Datei gekapselt.
(() => {
  // Ich lese den öffentlichen Schlüssel aus dem Script-Tag der geöffneten Spielseite.
  // Clerk weiß damit, zu welchem Anmeldeprojekt diese Seite gehört. Fehlt der Schlüssel, höre ich hier auf.
  const key = document.currentScript.dataset.publishableKey;
  // Ich verwende für jedes Spiel einen eigenen Schlüssel und behalte für Sudoku den bisherigen bei.
  const hasGame = typeof gameApp !== 'undefined';
  const progress = typeof levelProgress === 'undefined' ? {} : levelProgress;
  const { saveKey, restoreSave } = hasGame ? gameApp : progress;
  const autosaveInterval = 15_000;

  // Sudoku speichert seine Eingaben bereits direkt im Browser.
  const localSaveKey = hasGame && saveKey !== 'sudokuSave' ? `brainly:${saveKey}` : null;
  if (localSaveKey) {
    const saveLocally = () => {
      try {
        localStorage.setItem(localSaveKey, gameApp.captureSave());
      } catch {
        // Bei blockiertem Browserspeicher bleibt der Spielstand im Tab.
      }
    };
    try {
      const snapshot = localStorage.getItem(localSaveKey);
      if (snapshot !== null) restoreSave(snapshot);
    } catch {
      // Das Spiel startet mit seiner normalen Voreinstellung.
    }
    setInterval(saveLocally, autosaveInterval);
    window.addEventListener('pagehide', saveLocally);
  }
  let savedGame = hasGame ? gameApp.captureSave() : null;
  if (!key) return;
  const translate = hasGame ? gameApp.translate : window.translate;

  // Mit querySelector suche ich Elemente anhand ihrer ID. Das # steht für eine ID im HTML.
  const footerStatus = document.querySelector('#footer-account-status');
  // Ich zeige denselben Hinweis im Menü und unten auf der Seite an, etwa nach dem Speichern.
  function showStatus(text) {
    footerStatus.textContent = text;
  }

  // Hier hole ich die Buttons aus dem HTML, damit ich später festlegen kann, was ein Klick auslöst.
  const footerSignIn = document.querySelector('#footer-sign-in');
  const footerLoad = document.querySelector('#footer-load');
  const footerProfile = document.querySelector('#footer-profile');
  const signUp = document.querySelector('#footer-sign-up');
  // In dieser Liste sammle ich alle Konto-Buttons. So kann ich sie bei einer laufenden Aktion gemeinsam sperren.
  const controls = [footerProfile, signUp, footerSignIn, footerLoad];
  // Ich übergebe deutschen und englischen Text. Der Ausdruck mit ? wählt anhand der Seitensprache einen davon.
  const message = (de, en) => document.documentElement.lang === 'en' ? en : de;

  // Ich füge ein Script-Tag für eine externe Datei hinzu. Das Promise steht für das Ergebnis des Ladens.
  // onload meldet Erfolg, onerror einen Fehler. Mit await kann ich später auf das Ergebnis warten.
  function loadScript(url, publishableKey) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.crossOrigin = 'anonymous';
      if (publishableKey) script.dataset.clerkPublishableKey = publishableKey;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }

  async function initialize() {
    // Ich hole den codierten Teil aus dem Schlüssel. atob wandelt ihn in lesbaren Text um.
    // Daraus lese ich den Hostnamen, also die Adresse, von der ich Clerk lade.
    const encoded = key.match(/^pk_(?:test|live)_([A-Za-z0-9+/=]+)$/)?.[1];
    const domain = encoded && atob(encoded).match(/^([a-z0-9.-]+)\$$/i)?.[1];
    if (!domain) throw new Error('Invalid Clerk publishable key');
    // Ich warte zuerst auf die Oberfläche, dann auf die Funktionen für das Konto.
    // Erst nach clerk.load kann ich prüfen, wer angemeldet ist, oder ein Fenster öffnen.
    await loadScript(`https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`);
    await loadScript(`https://${domain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, key);
    const clerk = window.Clerk;
    await clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });

    // Ich merke mir die Sprache des Dialogs. Wenn die Spielsprache davon abweicht,
    // lade ich die passende Übersetzung, bevor ich das Fenster öffne.
    let dialogLanguage = 'en';
    async function openAccountDialog(openDialog) {
      try {
        showStatus('');
        const language = document.documentElement.lang === 'en' ? 'en' : 'de';
        if (language !== dialogLanguage) {
          const localization = language === 'de'
            ? (await import('https://cdn.jsdelivr.net/npm/@clerk/localizations@4.24.6/dist/de-DE.mjs')).deDE
            : (await import('https://cdn.jsdelivr.net/npm/@clerk/localizations@4.24.6/dist/en-US.mjs')).enUS;
          await clerk.__internal_updateProps({ options: { localization } });
          dialogLanguage = language;
        }
        await openDialog();
      } catch {
        showStatus(message('Anmeldedialog konnte nicht geöffnet werden.', 'Could not open the account dialog.'));
      }
    }

    // Hier öffne ich das fertige Anmeldefenster von Clerk. openSignUp öffnet entsprechend die Registrierung.
    const openSignIn = () => openAccountDialog(() => clerk.openSignIn());
    const openSignUp = () => openAccountDialog(() => clerk.openSignUp());

    // Ich erkenne die aktive Anmeldung an clerk.user.
    // Je nach Anmeldung zeige ich die passenden Konto-Buttons.
    function render() {
      const signedIn = Boolean(clerk.user);
      signUp.hidden = signedIn;
      footerSignIn.hidden = false;
      footerLoad.hidden = false;
      footerSignIn.dataset.text = signedIn ? 'accountSignOut' : 'accountSignIn';
      footerSignIn.textContent = translate(footerSignIn.dataset.text);
      footerProfile.hidden = !signedIn;
    }

    // Ich verwende denselben Ablauf für Laden und Abmelden.
    // Ohne Anmeldung öffne ich zuerst das Anmeldefenster. Danach muss man die Aktion erneut anklicken.
    // In finally schalte ich die Buttons auch nach Fehlern oder einem vorzeitigen Ende wieder frei.
    let accountActionRunning = false;
    let syncRunning = false;
    function run(action) {
      return async () => {
        if (accountActionRunning || syncRunning) return;
        accountActionRunning = true;
        controls.forEach(button => { button.disabled = true; });
        showStatus('');
        try {
          if (!clerk.user) {
            await openSignIn();
            return;
          }
          await action();
        } catch {
          showStatus(message('Vorgang fehlgeschlagen. Bitte erneut versuchen.', 'Action failed. Please try again.'));
        } finally {
          accountActionRunning = false;
          controls.forEach(button => { button.disabled = false; });
          render();
        }
      };
    }

    signUp.onclick = openSignUp;
    footerProfile.onclick = () => openAccountDialog(() => clerk.openUserProfile());
    // Über den Footer-Button öffne ich die Anmeldung oder melde eine aktive Sitzung ab.
    footerSignIn.onclick = run(() => clerk.signOut());
    let syncedUser;
    let savedLevel;
    async function syncProgress() {
      const user = clerk.user;
      if (!user || syncRunning || accountActionRunning) return;
      const game = hasGame ? gameApp.captureSave() : null;
      if (syncedUser === user.id && game === savedGame && progress.captureSave() === savedLevel) return;

      syncRunning = true;
      try {
        await user.reload();
        if (clerk.user?.id !== user.id) return;
        const remote = user.unsafeMetadata;
        const remoteLevel = remote[progress.saveKey];
        if (typeof remoteLevel === 'string' && !progress.restoreSave(remoteLevel)) {
          throw new Error('Invalid online XP');
        }

        const level = progress.captureSave();
        const updates = {};
        if (level !== remoteLevel) updates[progress.saveKey] = level;
        if (hasGame && game !== remote[saveKey] &&
            (game !== savedGame || typeof remote[saveKey] !== 'string')) {
          updates[saveKey] = game;
        }
        if (Object.keys(updates).length) await user.updateMetadata({ unsafeMetadata: updates });
        syncedUser = user.id;
        savedLevel = level;
        savedGame = game;
      } catch {
        showStatus(message('Automatisches Speichern fehlgeschlagen. Erneuter Versuch in 15 Sekunden.',
          'Autosave failed. Retrying in 15 seconds.'));
      } finally {
        syncRunning = false;
      }
    }
    setInterval(syncProgress, autosaveInterval);

    footerLoad.onclick = run(async () => {
      const user = clerk.user;
      await user.reload();
      // Ich prüfe nach dem Warten, ob noch dasselbe Konto aktiv ist. Bei einem Wechsel breche ich ab.
      if (clerk.user?.id !== user.id) return;
      // Ich lese den gespeicherten Text vom Konto. Ohne einen Text gibt es hier keinen Online-Spielstand zum Laden.
      const snapshot = user.unsafeMetadata[saveKey];
      if (typeof snapshot !== 'string') {
        showStatus(message('Kein Online-Spielstand vorhanden.', 'No online save found.'));
        return;
      }
      const prompt = hasGame
        ? message('Den aktuellen Spielstand ersetzen?', 'Replace the current game?')
        : message('Den Online-XP-Stand mit dem lokalen Fortschritt zusammenführen?',
          'Merge online XP with your local progress?');
      if (!confirm(prompt)) return;
      // Ich verwende die Spiellogik, um den gespeicherten Stand zu prüfen und wiederherzustellen.
      if (!restoreSave(snapshot)) throw new Error('Invalid game save');
      if (hasGame) savedGame = gameApp.captureSave();
      showStatus(message('Online-Spielstand geladen.', 'Online save loaded.'));
    });
    // Ich lasse die Oberfläche erneut aktualisieren, wenn Clerk eine Änderung bei der Anmeldung meldet.
    clerk.addListener(render);
    render();
  }

  // Wenn beim Start etwas schiefgeht, blende ich die Konto-Buttons aus und zeige im Menü eine Meldung.
  initialize().catch(() => {
    controls.forEach(button => { button.hidden = true; });
    showStatus(message('Anmeldung derzeit nicht verfügbar.', 'Sign-in is currently unavailable.'));
  });
})();
