// Ich gleiche XP und die getrennten Rätselstände automatisch mit dem angemeldeten Konto ab.
// Ich verbinde die Anmeldung mit Clerk und gleiche Spielstände im Browser und im Konto ab.
(() => {
  // Ich lese den öffentlichen Schlüssel aus dem Script-Tag der geöffneten Spielseite.
  // Ich wähle mit dem Schlüssel das Clerk-Projekt aus und kann lokale Spielstände auch ohne Clerk verwenden.
  const key = document.currentScript.dataset.publishableKey;
  // Ich verwende für jedes Spiel einen eigenen Schlüssel und behalte für Sudoku den bisherigen bei.
  const hasGame = typeof gameApp !== 'undefined';
  const progress = typeof levelProgress === 'undefined' ? {} : levelProgress;
  const { saveKey, restoreSave } = hasGame ? gameApp : progress;
  const autosaveInterval = 15_000;
  const autoloadInterval = 20_000;

  // Ich verwende für Sudoku den bereits vorhandenen lokalen Spielstand.
  // Ich gebe Mudoku und Wordle je einen eigenen Eintrag im Browserspeicher. Sudoku speichert schon direkt bei jeder Eingabe.
  const localSaveKey = hasGame && saveKey !== 'sudokuSave' ? `brainly:${saveKey}` : null;
  if (localSaveKey) {
    const saveLocally = () => {
      try {
        localStorage.setItem(localSaveKey, gameApp.captureSave());
      } catch {
        // Ich behalte den Spielstand im aktuellen Tab, wenn der Browser den Speicher blockiert.
      }
    };
    try {
      const snapshot = localStorage.getItem(localSaveKey);
      if (snapshot !== null) restoreSave(snapshot);
    } catch {
      // Ich starte mit der normalen Voreinstellung, wenn ich den lokalen Spielstand nicht öffnen kann.
    }
    setInterval(saveLocally, autosaveInterval);
    window.addEventListener('pagehide', saveLocally);
  }
  let savedGame = hasGame ? gameApp.captureSave() : null;
  if (!key) return;
  const translate = hasGame ? gameApp.translate : window.translate;

  // Mit querySelector suche ich Elemente anhand ihrer ID. Das # steht für eine ID im HTML.
  const footerStatus = document.querySelector('#footer-account-status');
  // Ich zeige Konto-Meldungen im Footer an.
  function showStatus(text) {
    footerStatus.textContent = text;
  }

  // Hier hole ich die Buttons aus dem HTML, damit ich später festlegen kann, was ein Klick auslöst.
  const sessionButton = document.querySelector('#account-session');
  const footerProfile = document.querySelector('#footer-profile');
  // In dieser Liste sammle ich alle Konto-Buttons. So kann ich sie bei einer laufenden Aktion gemeinsam sperren.
  const controls = [footerProfile, sessionButton];
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

    const openSignIn = () => openAccountDialog(() => clerk.openSignIn());

    // Ich erkenne die aktive Anmeldung an clerk.user.
    // Je nach Anmeldung zeige ich die passenden Konto-Buttons.
    function render() {
      const signedIn = Boolean(clerk.user);
      sessionButton.hidden = false;
      sessionButton.dataset.text = signedIn ? 'accountSignOut' : 'accountSignIn';
      sessionButton.textContent = translate(sessionButton.dataset.text);
      footerProfile.hidden = !signedIn;
    }

    // Ich sperre die Konto-Buttons während einer laufenden Aktion.
    let accountActionRunning = false;
    function run(action) {
      return async () => {
        if (accountActionRunning) return;
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

    footerProfile.onclick = () => openAccountDialog(() => clerk.openUserProfile());
    // Über den Konto-Button öffne ich die Anmeldung oder melde eine aktive Sitzung ab.
    sessionButton.onclick = run(() => clerk.signOut());
    // Ich merke mir das aktive Konto und die zuletzt abgeglichenen Spielstände, um Änderungen zu erkennen.
    let activeUserId;
    let remoteGame;
    let savedLevel;
    let syncQueue = Promise.resolve();
    let syncError = '';

    // Ich warte auf den Online-Stand und prüfe danach erneut, ob noch dasselbe Konto angemeldet ist.
    async function syncProgress(user, load) {
      if (accountActionRunning || clerk.user?.id !== user.id) return;
      try {
        const game = hasGame ? gameApp.captureSave() : null;
        if (!load && savedLevel !== undefined && game === savedGame &&
            progress.captureSave() === savedLevel) return;

        await user.reload();
        if (accountActionRunning || clerk.user?.id !== user.id) return;

        // Ich führe Rätselabschlüsse und Minispiel-XP aus Browser und Konto zusammen.
        const metadata = user.unsafeMetadata;
        const onlineLevel = metadata[progress.saveKey];
        if (typeof onlineLevel === 'string' && !progress.restoreSave(onlineLevel)) {
          throw new Error('Invalid online XP');
        }
        const level = progress.captureSave();
        const onlineGame = metadata[saveKey];
        const currentGame = hasGame ? gameApp.captureSave() : null;

        // Ich übernehme den Online-Rätselstand nur, wenn seit dem letzten Abgleich keine offenen lokalen Änderungen vorliegen.
        if (load) {
          // Ich schütze offene lokale Spielzüge und noch nicht bestätigte Worteingaben vor dem Online-Abruf.
          if (hasGame && typeof onlineGame === 'string' && onlineGame !== remoteGame &&
              currentGame === game && currentGame === savedGame &&
              !document.querySelector('#ladder-input')?.value) {
            if (onlineGame !== currentGame && !restoreSave(onlineGame)) throw new Error('Invalid online game');
            remoteGame = onlineGame;
            savedGame = gameApp.captureSave();
          }
        } else {
          // Ich sammle nur die Felder, deren Inhalt geändert wurde oder online fehlt.
          const updates = {};
          if (level !== onlineLevel) updates[progress.saveKey] = level;
          if (hasGame && currentGame !== onlineGame &&
              (currentGame !== savedGame || typeof onlineGame !== 'string')) {
            updates[saveKey] = currentGame;
          }
          if (Object.keys(updates).length) await user.updateMetadata({ unsafeMetadata: updates });
          if (clerk.user?.id !== user.id) return;
          savedLevel = level;
          if (updates[saveKey] !== undefined || currentGame === onlineGame) {
            remoteGame = currentGame;
            savedGame = currentGame;
          }
        }

        if (syncError && footerStatus.textContent === syncError) showStatus('');
        syncError = '';
      } catch {
        syncError = message('Online-Spielstand konnte nicht synchronisiert werden.',
          'Could not sync online progress.');
        showStatus(syncError);
      }
    }

    // Ich reihe Abrufe und Speichervorgänge hintereinander ein, damit sie sich nicht während des Wartens überholen.
    function scheduleSync(load) {
      const user = clerk.user;
      if (user) syncQueue = syncQueue.then(() => syncProgress(user, load));
    }

    // Ich starte bei einer neuen Anmeldung mit einem Abruf und setze die Vergleichswerte für das Konto zurück.
    function updateSession() {
      render();
      const userId = clerk.user?.id;
      if (userId === activeUserId) return;
      activeUserId = userId;
      remoteGame = undefined;
      savedLevel = undefined;
      scheduleSync(true);
    }

    clerk.addListener(updateSession);
    updateSession();
    // Ich lasse den Browser alle 15 Sekunden speichern und alle 20 Sekunden nach Online-Änderungen fragen.
    setInterval(() => scheduleSync(false), autosaveInterval);
    setInterval(() => scheduleSync(true), autoloadInterval);
  }

  // Wenn beim Start etwas schiefgeht, blende ich die Konto-Buttons aus und zeige im Footer eine Meldung.
  initialize().catch(() => {
    controls.forEach(button => { button.hidden = true; });
    showStatus(message('Anmeldung derzeit nicht verfügbar.', 'Sign-in is currently unavailable.'));
  });
})();
