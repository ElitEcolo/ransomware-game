(() => {
  const gameContent = document.getElementById("game-content");
  const profileBadge = document.getElementById("profile-badge");
  const accessibilityStatus = document.getElementById("accessibility-status");
  const accessibilityPanel = document.getElementById("accessibility-panel");
  const accessibilityToggle = document.getElementById("accessibility-toggle");
  const readingRuler = document.getElementById("reading-ruler");
  const preferenceKey = "cyberatelier-accessibility-v1";
  const defaults = {
    easyRead: false,
    dyslexia: false,
    spacing: false,
    ruler: false,
    textSize: "normal",
    contrast: "none",
    motion: false,
    speech: false,
    targets: false,
    keyboard: false
  };
  const validTextSizes = ["small", "normal", "large"];
  const validContrasts = ["none", "high", "cream"];
  let preferences = { ...defaults };
  let speechButton = null;
  let speechUtterance = null;
  const originalTextNodes = new WeakMap();
  const falcListOrigins = new WeakMap();
  let falcDescriptionCount = 0;
  const easyReadText = new Map([
    ["Un message arrive. Il semble plausible, urgent, peut-être même attendu. Choisis un profil pour découvrir un scénario conçu autour des pièges auxquels on peut réellement être confronté.", "Tu reçois un message. Il peut être vrai ou faux. Choisis un scénario pour apprendre à repérer les pièges."],
    ["Choisis ton scénario", "Choisis une situation"],
    ["Un remboursement santé semble bloqué. Un courriel bien présenté demande de mettre à jour tes coordonnées sous 48 heures.", "Un message parle d’un remboursement santé. Il te demande de vérifier tes informations en 48 heures."],
    ["Une démarche de santé présentée comme importante.", "Un remboursement qui semble urgent."],
    ["Tu aurais gagné un mois de Nitro ou des V-Bucks. Pour réclamer le lot, il faut te connecter rapidement.", "Un message dit que tu as gagné un cadeau pour un jeu. Il te demande de te connecter vite."],
    ["Une récompense inattendue pour un jeu que tu connais bien.", "Un cadeau que tu n’attendais pas."],
    ["Les RH ou la direction demandent de consulter un document confidentiel ou de valider une note de frais.", "Un message du travail te demande d’ouvrir un document ou de vérifier une facture."],
    ["Une demande professionnelle à traiter pendant une journée chargée.", "Une demande du travail qui semble urgente."],
    ["Rappel : Mise à jour de votre dossier de remboursement santé (Action requise sous 48h)", "Remboursement santé : vérifie ton dossier"],
    ["Félicitations ! Tu as gagné 1 mois de Nitro exclusif", "Tu as gagné un mois de Nitro !"],
    ["CONFIDENTIEL : Validation obligatoire de votre note de frais", "Urgent : vérifie ta note de frais"],
    ["Dans le cadre du suivi de votre dossier, un virement de remboursement santé est actuellement en attente. Une vérification de vos coordonnées de remboursement est nécessaire avant son traitement.", "Ton remboursement semble attendre. Le message te demande de vérifier tes informations."],
    ["Cette démarche peut être effectuée en quelques instants depuis votre espace sécurisé. Merci de la réaliser sous 48 heures afin d'éviter un retard de traitement.", "Le message dit de faire vite. Prends le temps de vérifier sur le site officiel."],
    ["Si vous avez déjà effectué cette démarche, vous pouvez ignorer ce rappel.", "Si tu as déjà fait cette démarche, ignore le message."],
    ["Ton pseudo a été sélectionné lors de notre tirage communautaire. Ton lot t'attend.", "Le message dit que tu as gagné un cadeau."],
    ["Pour ajouter le cadeau à ton compte, confirme ton identité avant ce soir. Les lots non réclamés seront remis au prochain gagnant.", "Le message te demande de te connecter avant ce soir. C’est un signe de piège."],
    ["Dans le cadre de la clôture mensuelle, votre note de frais présente un élément à confirmer. Le remboursement associé est actuellement en attente.", "Le message parle d’une note de frais à vérifier."],
    ["Merci de consulter le document confidentiel et de valider les informations avant la fin de journée afin que le traitement puisse être effectué dans les délais.", "Le message te demande d’ouvrir un document aujourd’hui. Vérifie d’abord avec ton équipe."],
    ["Le lien t'a conduit vers une fausse page qui imitait une démarche de remboursement.", "Tu as ouvert un faux site. Il imitait un service de remboursement."],
    ["Le lien t'a conduit vers une fausse page de connexion qui imitait le service de jeu.", "Tu as ouvert un faux site. Il imitait le service de jeu."],
    ["Le lien t'a conduit vers une fausse page de partage qui imitait un document professionnel.", "Tu as ouvert une fausse page. Elle imitait un document du travail."],
    ["Dans cet exercice, aucune donnée n'a été demandée ni enregistrée.", "Dans ce jeu, aucune donnée n’a été demandée ni gardée."],
    ["Dans cet exercice, aucune donnée n'a été demandée ni enregistrée. Dans une vraie attaque, cette page pourrait voler des coordonnées personnelles ou bancaires. Si tu as communiqué des informations, contacte rapidement ta banque et l'organisme via leurs coordonnées officielles. Un délai pressant et un remboursement en attente sont des raisons de vérifier, pas de se précipiter.", "Dans ce jeu, aucune donnée n’a été demandée. Dans la vraie vie, un faux site peut voler tes informations. Si tu les as données, appelle ta banque et l’organisme avec un numéro officiel. Ne rappelle pas le numéro du message."],
    ["Dans cet exercice, aucun mot de passe ni code n'a été demandé ou enregistré. Dans une vraie attaque, une fausse connexion pourrait permettre le vol du compte. Si tu as déjà saisi ton mot de passe, change-le depuis l'application officielle, déconnecte les sessions inconnues et préviens un adulte de confiance. Ne partage jamais un code de double authentification, même pour recevoir un cadeau.", "Dans ce jeu, aucun mot de passe n’a été demandé. Dans la vraie vie, un faux site peut voler ton compte. Si tu as donné ton mot de passe, change-le dans l’application officielle. Préviens un adulte. Ne donne jamais ton code de sécurité."],
    ["Dans cet exercice, aucun identifiant n'a été demandé ni enregistré. Dans une vraie attaque, la page pourrait voler un mot de passe professionnel ou pousser au téléchargement d'un fichier malveillant. Si tu as saisi tes identifiants, ouvert un fichier ou approuvé une demande de connexion, préviens immédiatement l'équipe informatique et suis ses consignes.", "Dans ce jeu, aucun mot de passe n’a été demandé. Dans la vraie vie, un faux site peut voler ton compte ou installer un virus. Préviens vite l’équipe informatique si tu as ouvert un fichier ou donné ton mot de passe."],
    ["Ne passe pas par le lien reçu. Ouvre toi-même le site ou l'application officielle.", "N’utilise pas le lien du message. Ouvre le site officiel toi-même."],
    ["Vérifie l'expéditeur et la demande. Un logo ou un nom affiché ne garantit rien.", "Regarde l’adresse complète. Un logo ne prouve pas que le message est vrai."],
    ["Ne transmets jamais de codes. En cas de doute, appelle un numéro officiel déjà connu.", "Ne donne jamais tes codes. En cas de doute, appelle un numéro officiel."],
    ["Pas de cadeau sans vérification. Consulte l'application officielle, pas le lien du message.", "Un cadeau inattendu ? Vérifie dans l’application officielle."],
    ["Garde tes identifiants et tes codes. Ne les communique à personne, même pour un lot.", "Ne donne jamais ton mot de passe ni ton code."],
    ["Demande de l'aide et signale. Un adulte de confiance peut t'aider sans te juger.", "Demande de l’aide à un adulte de confiance."],
    ["Vérifie l'adresse complète. Le nom affiché peut être usurpé.", "Lis l’adresse complète de l’expéditeur. Son nom peut être faux."],
    ["Confirme hors du fil suspect. Utilise l'annuaire ou un canal professionnel connu.", "Vérifie la demande avec un numéro ou un contact que tu connais."],
    ["Signale rapidement à l'IT. Surtout si tu as cliqué, ouvert un fichier ou saisi un mot de passe.", "Signale vite le message à l’équipe informatique."],
    ["Ne passe pas par le lien reçu.", "N’utilise pas le lien du message."],
    ["Vérifie l'adresse et la demande.", "Lis l’adresse complète. Le nom peut être faux."],
    ["Ne transmets jamais de codes.", "Ne donne jamais tes codes secrets."],
    ["Pas de cadeau sans vérification.", "Un cadeau inattendu ? Vérifie dans l’application officielle."],
    ["Garde tes identifiants et tes codes.", "Garde ton mot de passe et tes codes secrets."],
    ["Demande de l'aide et signale.", "Demande de l’aide à un adulte de confiance."],
    ["Vérifie l'adresse complète.", "Lis l’adresse complète de l’expéditeur."],
    ["Confirme hors du fil suspect.", "Vérifie la demande avec un contact que tu connais."],
    ["Signale rapidement à l'IT.", "Signale vite le message à l’équipe informatique."],
    ["Trois réflexes pour les démarches administratives", "Trois choses à faire pour vérifier un message"],
    ["Trois réflexes pour les cadeaux en ligne", "Trois choses à faire avant d’accepter un cadeau"],
    ["Trois réflexes au travail", "Trois choses à faire pour vérifier un message du travail"],
    ["Cette recherche est une simulation pédagogique. Elle n'envoie pas ta requête à un moteur tiers. Vérifie toujours le nom de domaine avant d'ouvrir un site.", "Cette recherche est un exemple. Elle n’envoie rien sur Internet. Vérifie l’adresse du site avant de l’ouvrir."],
    ["Pour vérifier un remboursement, ouvrez vous-même ameli.fr ou l'application officielle. Vous pouvez également appeler un numéro figurant sur vos documents habituels.", "Pour vérifier un remboursement, ouvre le site officiel toi-même. Tu peux aussi appeler un numéro que tu connais."],
    ["Pour vérifier une récompense, ouvre l'application ou le site officiel toi-même. Ne donne jamais ton mot de passe ou un code de connexion pour recevoir un cadeau.", "Ouvre toi-même l’application officielle. Ne donne jamais ton mot de passe ni un code pour recevoir un cadeau."],
    ["Pour vérifier une demande interne, utilise l'annuaire ou l'intranet depuis un favori connu. Confirme auprès des RH et signale le courriel à l'équipe informatique.", "Pour vérifier une demande du travail, appelle les RH avec un numéro connu. Signale le message à l’équipe informatique."],
    ["Pièce jointe inattendue · cliquer pour simuler son ouverture", "Ce fichier est inattendu. Clique pour voir les risques. Aucun fichier ne sera téléchargé."],
    ["Simulation terminée — aucun fichier n’a été téléchargé.", "Le jeu est terminé. Aucun fichier n’a été téléchargé."],
    ["Attention, c’était un piège — aucun fichier n’a été ouvert.", "Attention : c’était un piège. Aucun fichier n’a été ouvert."],
    ["Une facture inattendue peut contenir des liens trompeurs ou exploiter un logiciel de lecture non à jour. Confirme la demande par un numéro ou un canal professionnel déjà connu, et signale la pièce jointe à l’équipe informatique.", "Cette facture peut cacher un piège. Vérifie-la avec ton équipe et un numéro connu. Signale le fichier à l’équipe informatique."],
    ["Un fichier APK reçu par courriel peut installer une application malveillante et demander des permissions dangereuses. N’installe pas d’application depuis une pièce jointe : passe par la boutique officielle et demande conseil à un adulte de confiance.", "Ce fichier peut installer une application dangereuse. Ne l’installe pas. Utilise la boutique officielle. Demande conseil à un adulte de confiance."]
  ]);
  const destinations = {
    SP: "https://ameli.fr.com-support-secu.tk.invalid/verification",
    JD: "https://discord.com-support-secu.tk.invalid/recompense",
    PR: "https://rh-partage.com-support-secu.tk.invalid/document"
  };
  const selectionIcons = {
    selected: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" fill="#0b57d0" stroke="#0b57d0"/><path d="m8 12 2.5 2.5L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    unselected: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.7"/></svg>'
  };

  function setStatus(message) {
    accessibilityStatus.textContent = message;
    document.getElementById("a11y-live-status").textContent = message;
  }

  function validPreferences(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return { ...defaults };
    return {
      easyRead: value.easyRead === true,
      dyslexia: value.dyslexia === true,
      spacing: value.spacing === true,
      ruler: value.ruler === true,
      textSize: validTextSizes.includes(value.textSize) ? value.textSize : defaults.textSize,
      contrast: validContrasts.includes(value.contrast) ? value.contrast : defaults.contrast,
      motion: value.motion === true,
      speech: value.speech === true,
      targets: value.targets === true,
      keyboard: value.keyboard === true
    };
  }

  try {
    const saved = window.localStorage.getItem(preferenceKey);
    if (saved !== null) preferences = validPreferences(JSON.parse(saved));
  } catch (error) {
    setStatus("Le stockage local n’est pas disponible : les préférences ne seront pas conservées après fermeture.");
    console.error("Impossible de lire les préférences d’accessibilité enregistrées.", error);
  }

  function persistPreferences() {
    try {
      window.localStorage.setItem(preferenceKey, JSON.stringify(preferences));
      return true;
    } catch (error) {
      setStatus("Réglage appliqué, mais impossible de l’enregistrer dans ce navigateur.");
      console.error("Impossible d’enregistrer les préférences d’accessibilité.", error);
      return false;
    }
  }

  function updatePressedControls() {
    document.querySelectorAll("[data-a11y-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(preferences[button.dataset.a11yToggle]));
    });
    document.getElementById("keyboard-shortcut-help").hidden = !preferences.keyboard;
    document.querySelectorAll("[data-text-size]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.textSize === preferences.textSize));
    });
    document.querySelectorAll("[data-a11y-contrast]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.a11yContrast === preferences.contrast));
    });
  }

  function applyPreferences() {
    const { body } = document;
    body.classList.toggle("dyslexia-font", preferences.dyslexia);
    body.classList.toggle("easy-read", preferences.easyRead);
    body.classList.toggle("spacious-text", preferences.spacing);
    body.classList.toggle("high-contrast", preferences.contrast === "high");
    body.classList.toggle("cream-mode", preferences.contrast === "cream");
    body.classList.toggle("reduce-motion", preferences.motion);
    body.classList.toggle("large-targets", preferences.targets);
    body.dataset.textScale = preferences.textSize;
    readingRuler.hidden = !preferences.ruler;
    applyEasyRead(document.getElementById("home-page"));
    applyEasyRead(gameContent);
    enhanceAccessibleControls();
    updatePressedControls();
    updateSpeechControls();
  }

  function openAccessibilityPanel(open) {
    accessibilityPanel.hidden = !open;
    accessibilityToggle.setAttribute("aria-expanded", String(open));
    accessibilityToggle.setAttribute("aria-label", open
      ? "Fermer les options d’accessibilité"
      : "Ouvrir les options d’accessibilité");
    // This is a non-modal region: focus enters on open, then follows the normal document Tab order.
    if (open) accessibilityPanel.querySelector("button").focus();
    else accessibilityToggle.focus();
  }

  accessibilityToggle.addEventListener("click", () => {
    openAccessibilityPanel(accessibilityPanel.hidden);
  });
  document.getElementById("accessibility-close").addEventListener("click", () => openAccessibilityPanel(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !accessibilityPanel.hidden) openAccessibilityPanel(false);
    if (event.key === "Tab") document.body.classList.add("keyboard-navigation");
  });
  document.addEventListener("pointerdown", () => document.body.classList.remove("keyboard-navigation"));
  document.querySelectorAll("[data-a11y-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const preference = button.dataset.a11yToggle;
      preferences[preference] = !preferences[preference];
      applyPreferences();
      if (persistPreferences()) setStatus(`Option ${preferences[preference] ? "activée" : "désactivée"} : ${button.textContent.trim()}.`);
    });
  });
  document.querySelectorAll("[data-text-size]").forEach((button) => {
    button.addEventListener("click", () => {
      preferences.textSize = button.dataset.textSize;
      applyPreferences();
      if (persistPreferences()) {
        setStatus(preferences.textSize === "normal"
          ? "Taille de texte normale activée."
          : `Taille de texte ${preferences.textSize === "large" ? "agrandie" : "réduite"} activée.`);
      }
    });
  });
  document.querySelectorAll("[data-a11y-contrast]").forEach((button) => {
    button.addEventListener("click", () => {
      const contrast = button.dataset.a11yContrast;
      preferences.contrast = preferences.contrast === contrast ? "none" : contrast;
      applyPreferences();
      if (persistPreferences()) {
        setStatus(preferences.contrast === "none"
          ? "Affichage d’origine rétabli."
          : `${contrast === "high" ? "Haut contraste" : "Fond crème"} activé.`);
      }
    });
  });
  document.getElementById("accessibility-reset").addEventListener("click", () => {
    preferences = { ...defaults };
    applyPreferences();
    try {
      window.localStorage.removeItem(preferenceKey);
      setStatus("Préférences réinitialisées ; l’affichage d’origine est restauré.");
    } catch (error) {
      setStatus("Affichage réinitialisé, mais impossible d’effacer les préférences de ce navigateur.");
      console.error("Impossible d’effacer les préférences d’accessibilité.", error);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!preferences.keyboard || !event.ctrlKey || !event.altKey || !event.shiftKey) return;
    if (event.target.closest("input, textarea, select, [contenteditable='true']")) return;

    const key = event.key.toLowerCase();
    const digit = event.code.startsWith("Digit") ? event.code.slice(5) : "";
    const scenarioKeys = { "1": "senior", "2": "young", "3": "work" };
    if (scenarioKeys[digit]) {
      event.preventDefault();
      document.querySelector(`[data-scenario="${scenarioKeys[digit]}"]`).click();
    } else if (key === "a") {
      event.preventDefault();
      openAccessibilityPanel(accessibilityPanel.hidden);
    } else if (key === "i") {
      event.preventDefault();
      document.getElementById("home-button").click();
    }
  });

  function applyEasyRead(root) {
    if (!root) return;

    // Keep the source paragraph intact so disabling the aid restores the original content and semantics.
    if (!preferences.easyRead) {
      root.querySelectorAll("ul.falc-list").forEach((list) => {
        const originalParagraph = falcListOrigins.get(list);
        if (originalParagraph) list.previousElementSibling?.remove();
        if (originalParagraph) list.replaceWith(originalParagraph);
      });
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let textNode = walker.nextNode();
    while (textNode) {
      textNodes.push(textNode);
      textNode = walker.nextNode();
    }

    textNodes.forEach((node) => {
      if (!root.contains(node)) return;
      const original = originalTextNodes.get(node) ?? node.data;
      const simplified = easyReadText.get(original.trim());
      if (preferences.easyRead && simplified) {
        const paragraph = node.parentElement;
        if (paragraph?.tagName === "P" && paragraph.childNodes.length === 1) {
          const description = document.createElement("p");
          description.className = "falc-description";
          description.id = `falc-description-${++falcDescriptionCount}`;
          description.textContent = "Version simplifiée : lis un point à la fois.";

          const list = document.createElement("ul");
          list.className = "falc-list";
          list.setAttribute("aria-describedby", description.id);
          const points = simplified.match(/[^.!?]+[.!?]+|[^.!?]+$/gu) ?? [simplified];
          points.forEach((point) => {
            const item = document.createElement("li");
            item.textContent = point.trim();
            list.append(item);
          });

          paragraph.before(description, list);
          paragraph.remove();
          falcListOrigins.set(list, paragraph);
        } else {
          originalTextNodes.set(node, original);
          const whitespace = original.match(/^(\s*)(.*?)(\s*)$/s);
          node.data = `${whitespace[1]}${simplified}${whitespace[3]}`;
        }
      } else if (!preferences.easyRead && originalTextNodes.has(node)) {
        node.data = originalTextNodes.get(node);
        originalTextNodes.delete(node);
      }
    });
  }

  function enhanceAccessibleControls() {
    // WCAG 4.1.3: polite announcements communicate updates without moving keyboard focus.
    gameContent.setAttribute("aria-live", "polite");
    gameContent.setAttribute("aria-atomic", "false");
    const rows = gameContent.querySelectorAll(".mail-row");
    if (rows.length > 0) {
      gameContent.setAttribute("role", "list");
      gameContent.setAttribute("aria-label", "Messages de la boîte de réception");
      rows.forEach((row) => {
        row.setAttribute("role", "listitem");
        const openButton = row.querySelector("[data-open]");
        if (openButton) {
          const sender = row.querySelector(".row-sender")?.textContent.trim();
          const subject = row.querySelector(".row-subject")?.textContent.trim();
          if (sender && subject) openButton.setAttribute("aria-label", `Ouvrir le message : ${subject}, de ${sender}`);
        }
        const selectButton = row.querySelector("[data-select]");
        if (selectButton) {
          const selected = selectButton.getAttribute("aria-pressed") === "true";
          selectButton.setAttribute("aria-pressed", String(selected));
          selectButton.setAttribute("aria-label", selected ? "Désélectionner le message" : "Sélectionner le message");
          if (selectButton.dataset.accessibilityBound !== "true") {
            selectButton.dataset.accessibilityBound = "true";
            selectButton.addEventListener("click", () => {
              const isSelected = selectButton.getAttribute("aria-pressed") !== "true";
              selectButton.setAttribute("aria-pressed", String(isSelected));
              selectButton.setAttribute("aria-label", isSelected ? "Désélectionner le message" : "Sélectionner le message");
              selectButton.innerHTML = isSelected ? selectionIcons.selected : selectionIcons.unselected;
            });
          }
        }
      });
    } else {
      gameContent.setAttribute("role", "region");
      gameContent.setAttribute("aria-label", "Contenu de la simulation");
      gameContent.removeAttribute("aria-labelledby");
    }

    const tabs = document.getElementById("mail-tabs");
    tabs.setAttribute("role", "group");
    tabs.querySelectorAll(".mail-tab").forEach((tab) => {
      const selected = tab.classList.contains("active");
      tab.setAttribute("aria-pressed", String(selected));
    });

    document.getElementById("select-button").setAttribute("aria-controls", "game-content");
    const deleteButton = document.getElementById("delete-button");
    deleteButton.setAttribute("aria-label", "Supprimer le message affiché");
    deleteButton.setAttribute("aria-controls", "game-content");
    const keyboardShortcut = preferences.keyboard;
    document.querySelectorAll("[data-scenario]").forEach((button, index) => {
      const heading = button.closest(".scenario-card").querySelector("h2");
      button.setAttribute("aria-label", `Démarrer le scénario : ${heading.textContent.trim()}`);
      if (keyboardShortcut) button.setAttribute("aria-keyshortcuts", `Control+Alt+Shift+${index + 1}`);
      else button.removeAttribute("aria-keyshortcuts");
    });
    const accessibilityKey = accessibilityToggle;
    if (keyboardShortcut) {
      accessibilityKey.setAttribute("aria-keyshortcuts", "Control+Alt+Shift+A");
      document.getElementById("home-button").setAttribute("aria-keyshortcuts", "Control+Alt+Shift+I");
    } else {
      accessibilityKey.removeAttribute("aria-keyshortcuts");
      document.getElementById("home-button").removeAttribute("aria-keyshortcuts");
    }
    gameContent.querySelectorAll("[data-fake-link]").forEach((link) => {
      link.setAttribute("aria-label", `Simuler l’ouverture du lien : ${link.textContent.trim()}`);
    });
  }

  const mailTabs = document.getElementById("mail-tabs");
  mailTabs.addEventListener("click", (event) => {
    const selected = event.target.closest(".mail-tab");
    if (!selected) return;
    mailTabs.querySelectorAll(".mail-tab").forEach((tab) => {
      const isSelected = tab === selected;
      tab.setAttribute("aria-pressed", String(isSelected));
    });
  });
  function setSpeechButtonState(button, speaking) {
    button.setAttribute("aria-pressed", String(speaking));
    button.setAttribute("aria-label", speaking ? "Arrêter la lecture vocale en cours" : "Lire ce contenu à voix haute");
    button.textContent = speaking ? "⏹ Arrêter" : "🔊 Lire";
  }

  function readAloud(button, text) {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance !== "function") {
      setStatus("La synthèse vocale n’est pas disponible dans ce navigateur.");
      return;
    }
    if (speechButton === button && button.getAttribute("aria-pressed") === "true") {
      window.speechSynthesis.cancel();
      setSpeechButtonState(button, false);
      speechButton = null;
      speechUtterance = null;
      setStatus("Lecture vocale arrêtée.");
      return;
    }

    window.speechSynthesis.cancel();
    if (speechButton) setSpeechButtonState(speechButton, false);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    speechButton = button;
    speechUtterance = utterance;
    setSpeechButtonState(button, true);
    utterance.onend = () => {
      if (speechUtterance !== utterance) return;
      setSpeechButtonState(button, false);
      speechButton = null;
      speechUtterance = null;
      setStatus("Lecture vocale terminée.");
    };
    utterance.onerror = (event) => {
      if (speechUtterance !== utterance || event.error === "canceled" || event.error === "interrupted") return;
      setSpeechButtonState(button, false);
      speechButton = null;
      speechUtterance = null;
      setStatus("La lecture vocale a rencontré un problème.");
      console.error("La synthèse vocale a échoué.", event.error);
    };
    window.speechSynthesis.speak(utterance);
    setStatus("Lecture vocale en cours.");
  }

  function addSpeechButton(element, textProvider) {
    const next = element.nextElementSibling;
    if (next && next.classList.contains("speech-button")) return;
    const button = document.createElement("button");
    button.className = "speech-button";
    button.type = "button";
    button.textContent = "🔊 Lire";
    button.setAttribute("aria-label", "Lire ce contenu à voix haute");
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => readAloud(button, textProvider()));
    element.insertAdjacentElement("afterend", button);
  }

  function updateSpeechControls() {
    const roots = [document.getElementById("home-page"), gameContent];
    if (!preferences.speech) {
      roots.forEach((root) => root.querySelectorAll(".speech-button").forEach((button) => button.remove()));
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      speechButton = null;
      speechUtterance = null;
      return;
    }

    const homeTitle = document.getElementById("home-title");
    addSpeechButton(homeTitle, () => homeTitle.textContent);
    const homeInstructions = document.querySelector(".home-intro");
    addSpeechButton(homeInstructions, () => homeInstructions.textContent);
    document.querySelectorAll(".scenario-card").forEach((card) => {
      const heading = card.querySelector("h2");
      addSpeechButton(heading, () => `${heading.textContent}. ${card.querySelector(".falc-list")?.textContent ?? card.querySelector("p").textContent}`);
    });
    const statsTitle = document.getElementById("stats-title");
    addSpeechButton(statsTitle, () => statsTitle.textContent);
    gameContent.querySelectorAll(".detail-subject, .coach-message h1, .ending h3, .search-result h2, .attachment-debrief h2").forEach((heading) => {
      addSpeechButton(heading, () => heading.textContent);
    });
    const senderName = gameContent.querySelector(".sender-name");
    if (senderName) {
      addSpeechButton(senderName, () =>
        `${senderName.textContent}. ${gameContent.querySelector(".sender-address")?.textContent ?? ""}. ${gameContent.querySelector(".sender-date")?.textContent ?? ""}`
      );
    }
    gameContent.querySelectorAll(".detail-body, .coach-message .coach-body, .feedback, .search-simulated, .search-result p, .ending-header p, .golden-rules").forEach((content) => {
      addSpeechButton(content, () => {
        const readableContent = content.cloneNode(true);
        readableContent.querySelectorAll(".speech-button, .link-inspector, .attachment-debrief[hidden]").forEach((control) => control.remove());
        return readableContent.textContent.replace(/\s+/g, " ").trim();
      });
    });
  }

  document.addEventListener("pointermove", (event) => {
    if (!preferences.ruler) return;
    readingRuler.style.top = `${Math.max(0, event.clientY - 22)}px`;
  });
  document.addEventListener("focusin", (event) => {
    if (!preferences.ruler) return;
    const bounds = event.target.getBoundingClientRect();
    readingRuler.style.top = `${Math.max(0, bounds.top + (bounds.height - readingRuler.offsetHeight) / 2)}px`;
  });
  document.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse" && preferences.ruler) readingRuler.style.top = "-50px";
  });
  applyPreferences();

  function addLinkInspector(link, index) {
    const destination = destinations[profileBadge.textContent.trim()];
    if (!destination || link.dataset.inspected === "true") return;

    link.dataset.inspected = "true";
    const hintId = `link-destination-${index}`;
    const inspector = document.createElement("div");
    inspector.className = "link-inspector";

    const toggle = document.createElement("button");
    toggle.className = "link-inspector-toggle";
    toggle.type = "button";
    toggle.textContent = "Afficher l’adresse réelle";
    // WCAG 4.1.2: the disclosure state and controlled content stay synchronized.
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", hintId);

    const details = document.createElement("p");
    details.className = "link-inspector-details";
    details.id = hintId;
    details.hidden = true;
    details.setAttribute("role", "status");
    details.setAttribute("aria-live", "polite");
    details.append("Destination simulée (domaine réservé, sans site réel) : ");
    const code = document.createElement("code");
    code.textContent = destination;
    details.append(code);

    const hideUnlessExpanded = () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      const linkActive = link.matches(":hover, :focus");
      const inspectorActive = inspector.matches(":hover, :focus-within");
      details.hidden = !expanded && !linkActive && !inspectorActive;
    };

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(expanded));
      details.hidden = !expanded;
    });
    link.addEventListener("pointerenter", () => { details.hidden = false; });
    link.addEventListener("focus", () => { details.hidden = false; });
    link.addEventListener("pointerleave", hideUnlessExpanded);
    link.addEventListener("blur", hideUnlessExpanded);
    inspector.addEventListener("pointerenter", () => { details.hidden = false; });
    inspector.addEventListener("pointerleave", hideUnlessExpanded);
    inspector.addEventListener("focusout", hideUnlessExpanded);
    link.setAttribute("aria-describedby", hintId);

    inspector.append(toggle, details);
    link.insertAdjacentElement("afterend", inspector);
  }

  function addSenderDomain(senderInfo) {
    const address = senderInfo.querySelector(".sender-address");
    if (!address || senderInfo.querySelector(".domain-toggle")) return;
    const fullAddress = address.textContent.trim().replace(/^<|>$/g, "");
    const separator = fullAddress.lastIndexOf("@");
    const domain = separator < 0 ? fullAddress : fullAddress.slice(separator + 1);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "domain-toggle";
    toggle.textContent = "Voir le domaine";
    toggle.setAttribute("aria-expanded", "false");

    const details = document.createElement("p");
    details.className = "domain-details";
    details.id = "sender-domain-details";
    details.hidden = true;
    details.setAttribute("role", "status");
    toggle.setAttribute("aria-controls", details.id);
    details.append("Domaine exact de l’expéditeur : ");
    const code = document.createElement("code");
    code.textContent = domain;
    details.append(code);

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(expanded));
      details.hidden = !expanded;
      toggle.textContent = expanded ? "Masquer le domaine" : "Voir le domaine";
    });
    address.insertAdjacentElement("afterend", toggle);
    toggle.insertAdjacentElement("afterend", details);
  }

  function addAttachment(detailBody) {
    const profile = profileBadge.textContent.trim();
    if ((profile !== "JD" && profile !== "PR") || detailBody.querySelector(".attachment-simulation")) return;

    const isWork = profile === "PR";
    const filename = isWork ? "Facture_a_regler.pdf" : "Mise_a_jour_Nitro.apk";
    const format = isWork ? "PDF" : "APK";
    const attachment = document.createElement("button");
    attachment.type = "button";
    attachment.className = "attachment-simulation";
    attachment.setAttribute("aria-controls", "attachment-debrief");
    attachment.setAttribute("aria-expanded", "false");

    const icon = document.createElement("span");
    icon.className = "attachment-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = format;
    const copy = document.createElement("span");
    copy.className = "attachment-copy";
    const name = document.createElement("strong");
    name.textContent = filename;
    const hint = document.createElement("small");
    hint.textContent = "Pièce jointe inattendue · cliquer pour simuler son ouverture";
    copy.append(name, hint);
    attachment.append(icon, copy);

    const debrief = document.createElement("section");
    debrief.className = "attachment-debrief";
    debrief.id = "attachment-debrief";
    debrief.hidden = true;
    debrief.setAttribute("role", "alert");
    debrief.setAttribute("aria-live", "assertive");
    const heading = document.createElement("h2");
    heading.tabIndex = -1;
    heading.textContent = "Attention, c’était un piège — aucun fichier n’a été ouvert.";
    const explanation = document.createElement("p");
    explanation.textContent = isWork
      ? "Une facture inattendue peut contenir des liens trompeurs ou exploiter un logiciel de lecture non à jour. Confirme la demande par un numéro ou un canal professionnel déjà connu, et signale la pièce jointe à l’équipe informatique."
      : "Un fichier APK reçu par courriel peut installer une application malveillante et demander des permissions dangereuses. N’installe pas d’application depuis une pièce jointe : passe par la boutique officielle et demande conseil à un adulte de confiance.";
    debrief.append(heading, explanation);

    attachment.addEventListener("click", () => {
      // Announce the expanded state before moving focus to the visible debrief.
      attachment.setAttribute("aria-expanded", "true");
      attachment.disabled = true;
      hint.textContent = "Simulation terminée — aucun fichier n’a été téléchargé.";
      debrief.hidden = false;
      heading.focus();
    });
    detailBody.append(attachment, debrief);
  }

  function enhanceMessage() {
    gameContent.querySelectorAll("[data-fake-link]").forEach(addLinkInspector);
    const senderInfo = gameContent.querySelector(".sender-info");
    if (senderInfo) addSenderDomain(senderInfo);
    const detailBody = gameContent.querySelector(".detail-body");
    if (detailBody) addAttachment(detailBody);
    applyEasyRead(gameContent);
    enhanceAccessibleControls();
    updateSpeechControls();
  }

  new MutationObserver(enhanceMessage).observe(gameContent, { childList: true, subtree: true });
  applyEasyRead(document.getElementById("home-page"));
  enhanceAccessibleControls();
  enhanceMessage();

  const statsTotal = document.getElementById("stats-total");
  const statsImpact = document.getElementById("stats-impact");
  const updateStatsImpact = () => {
    const total = Number(statsTotal.textContent.replace(/[^\d]/g, ""));
    if (!Number.isSafeInteger(total) || total < 0) {
      statsImpact.textContent = "Les compteurs d’actions seront affichés dès que les statistiques seront disponibles.";
      return;
    }
    statsImpact.textContent = total === 0
      ? "Les premières décisions apparaîtront ici. Les compteurs ne représentent pas des visiteurs uniques."
      : `${new Intl.NumberFormat("fr-FR").format(total)} ${total === 1 ? "action éducative est" : "actions éducatives sont"} déjà comptabilisées. Chaque choix contribue à l’atelier ; ce total ne représente pas des visiteurs uniques.`;
  };
  new MutationObserver(updateStatsImpact).observe(statsTotal, { childList: true, characterData: true, subtree: true });
  updateStatsImpact();
})();
