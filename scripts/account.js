// Hier kümmere ich mich um Anmeldung, Konto und Online-Spielstände.
// Die äußere Funktion starte ich sofort. Ihre Variablen bleiben in dieser Datei gekapselt.
(() => {
  // Ich lese den öffentlichen Schlüssel aus dem Script-Tag in index.html.
  // Clerk weiß damit, zu welchem Anmeldeprojekt diese Seite gehört. Fehlt der Schlüssel, höre ich hier auf.
  const key = document.currentScript.dataset.publishableKey;
  if (!key) return;

  // Mit querySelector suche ich Elemente anhand ihrer ID. Das # steht für eine ID im HTML.
  const panel = document.querySelector('#account');
  const status = document.querySelector('#account-status');
  const footerStatus = document.querySelector('#footer-account-status');
  // Ich zeige denselben Hinweis im Menü und unten auf der Seite an, etwa nach dem Speichern.
  function showStatus(text) {
    status.textContent = text;
    footerStatus.textContent = text;
  }

  // Hier hole ich die Buttons aus dem HTML, damit ich später festlegen kann, was ein Klick auslöst.
  const signIn = document.querySelector('#account-sign-in');
  const footerSignIn = document.querySelector('#footer-sign-in');
  const footerSave = document.querySelector('#footer-save');
  const footerLoad = document.querySelector('#footer-load');
  const footerProfile = document.querySelector('#footer-profile');
  const profile = document.querySelector('#account-profile');
  const signUp = document.querySelector('#account-sign-up');
  const save = document.querySelector('#account-save');
  const load = document.querySelector('#account-load');
  const signOut = document.querySelector('#account-sign-out');
  // In dieser Liste sammle ich alle Konto-Buttons. So kann ich sie bei einer laufenden Aktion gemeinsam sperren.
  const controls = [profile, footerProfile, signIn, signUp, save, load, signOut, footerSignIn, footerSave, footerLoad];
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

    // Apply the current game language before opening a Clerk dialog.
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

    // Wenn clerk.user vorhanden ist, gibt es eine angemeldete Person. Danach entscheide ich,
    // welche Buttons zu sehen sind und ob unten Anmelden oder Abmelden steht.
    function render() {
      const signedIn = Boolean(clerk.user);
      signIn.hidden = signUp.hidden = signedIn;
      footerSignIn.hidden = footerSave.hidden = footerLoad.hidden = false;
      footerSignIn.dataset.text = signedIn ? 'accountSignOut' : 'accountSignIn';
      footerSignIn.textContent = translate(footerSignIn.dataset.text);
      profile.hidden = footerProfile.hidden = signOut.hidden = !signedIn;
    }

    // Ich verwende denselben Ablauf für Speichern, Laden und Abmelden.
    // Ohne Anmeldung öffne ich zuerst das Anmeldefenster. Danach muss man die Aktion erneut anklicken.
    // finally schaltet die Buttons auch dann wieder frei, wenn etwas schiefgeht oder der Ablauf früher endet.
    function run(action) {
      return async () => {
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
          controls.forEach(button => { button.disabled = false; });
          render();
        }
      };
    }

    signIn.onclick = openSignIn;
    signUp.onclick = openSignUp;
    profile.onclick = footerProfile.onclick = () => openAccountDialog(() => clerk.openUserProfile());
    const endSession = run(() => clerk.signOut());
    signOut.onclick = endSession;
    // Der Footer-Button nutzt denselben Ablauf: Ohne Sitzung öffnet er die Anmeldung, mit Sitzung meldet er ab.
    footerSignIn.onclick = endSession;
    save.onclick = footerSave.onclick = run(async () => {
      const user = clerk.user;
      // Ich verwandle den aktuellen Spielstand in JSON. Das ist eine Textform, die sich speichern und später wieder einlesen lässt.
      const snapshot = JSON.stringify(game);
      await user.reload();
      // Ich prüfe nach dem Warten, ob noch dasselbe Konto aktiv ist. Bei einem Wechsel breche ich ab.
      if (clerk.user?.id !== user.id) return;
      if (user.unsafeMetadata.sudokuSave && !confirm(message(
        'Den bisherigen Online-Spielstand ersetzen?', 'Replace the previous online save?'
      ))) return;
      // Ich lege den Spielstand beim Clerk-Konto unter sudokuSave ab.
      // unsafeMetadata kann vom Browser aus geändert werden. Ich nutze es hier für den Spielstand.
      await user.updateMetadata({ unsafeMetadata: { sudokuSave: snapshot } });
      showStatus(message('Online gespeichert.', 'Saved online.'));
    });
    load.onclick = footerLoad.onclick = run(async () => {
      const user = clerk.user;
      await user.reload();
      // Ich prüfe nach dem Warten, ob noch dasselbe Konto aktiv ist. Bei einem Wechsel breche ich ab.
      if (clerk.user?.id !== user.id) return;
      // Ich lese den gespeicherten Text vom Konto. Ohne einen Text gibt es hier keinen Online-Spielstand zum Laden.
      const snapshot = user.unsafeMetadata.sudokuSave;
      if (typeof snapshot !== 'string') {
        showStatus(message('Kein Online-Spielstand vorhanden.', 'No online save found.'));
        return;
      }
      if (!confirm(message('Den aktuellen Spielstand ersetzen?', 'Replace the current game?'))) return;
      // Ich lasse die Spieldatei den Stand prüfen und übernehmen. Danach leere ich die Feldauswahl,
      // speichere den Stand auch im Browser und zeige das neue Raster an.
      if (!loadGame(snapshot)) throw new Error('Invalid Sudoku save');
      selectedCell = -1;
      saveGame();
      renderBoard();
      if (game.done) advanceAfterCompletion();
      showStatus(message('Online-Spielstand geladen.', 'Online save loaded.'));
    });
    // Ich lasse die Oberfläche erneut aktualisieren, wenn Clerk eine Änderung bei der Anmeldung meldet.
    clerk.addListener(render);
    render();
    panel.hidden = false;
  }

  // Wenn beim Start etwas schiefgeht, blende ich die Konto-Buttons aus und zeige im Menü eine Meldung.
  initialize().catch(() => {
    controls.forEach(button => { button.hidden = true; });
    showStatus(message('Anmeldung derzeit nicht verfügbar.', 'Sign-in is currently unavailable.'));
    panel.hidden = false;
  });
})();
