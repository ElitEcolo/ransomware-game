(() => {
  const gameContent = document.getElementById("game-content");
  const profileBadge = document.getElementById("profile-badge");
  const accessibilityStatus = document.getElementById("accessibility-status");
  const accessibilityPanel = document.getElementById("accessibility-panel");
  const accessibilityToggle = document.getElementById("accessibility-toggle");
  const readingRuler = document.getElementById("reading-ruler");
  const preferenceKey = "cyberatelier-accessibility-v1";
  const defaults = {
    dyslexia: false,
    spacing: false,
    ruler: false,
    textSize: "normal",
    contrast: "none",
    motion: false,
    speech: false,
    targets: false
  };
  const validTextSizes = ["small", "normal", "large"];
  const validContrasts = ["none", "high", "cream"];
  let preferences = { ...defaults };
  let speechButton = null;
  let speechUtterance = null;
  const destinations = {
    SP: "https://ameli.fr.com-support-secu.tk.invalid/verification",
    JD: "https://discord.com-support-secu.tk.invalid/recompense",
    PR: "https://rh-partage.com-support-secu.tk.invalid/document"
  };

  function setStatus(message) {
    accessibilityStatus.textContent = message;
  }

  function validPreferences(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return { ...defaults };
    return {
      dyslexia: value.dyslexia === true,
      spacing: value.spacing === true,
      ruler: value.ruler === true,
      textSize: validTextSizes.includes(value.textSize) ? value.textSize : defaults.textSize,
      contrast: validContrasts.includes(value.contrast) ? value.contrast : defaults.contrast,
      motion: value.motion === true,
      speech: value.speech === true,
      targets: value.targets === true
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
    body.classList.toggle("spacious-text", preferences.spacing);
    body.classList.toggle("high-contrast", preferences.contrast === "high");
    body.classList.toggle("cream-mode", preferences.contrast === "cream");
    body.classList.toggle("reduce-motion", preferences.motion);
    body.classList.toggle("large-targets", preferences.targets);
    body.dataset.textScale = preferences.textSize;
    readingRuler.hidden = !preferences.ruler;
    updatePressedControls();
    updateSpeechControls();
  }

  function openAccessibilityPanel(open) {
    accessibilityPanel.hidden = !open;
    accessibilityToggle.setAttribute("aria-expanded", String(open));
    accessibilityToggle.setAttribute("aria-label", open
      ? "Fermer les options d’accessibilité"
      : "Ouvrir les options d’accessibilité");
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
      if (persistPreferences()) setStatus(`${button.textContent.trim()} ${preferences[preference] ? "activé" : "désactivé"}.`);
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

  function setSpeechButtonState(button, speaking) {
    button.setAttribute("aria-pressed", String(speaking));
    button.setAttribute("aria-label", speaking ? "Arrêter la lecture vocale" : "Lire à voix haute");
    button.textContent = speaking ? "⏹" : "🔊";
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
    button.textContent = "🔊";
    button.setAttribute("aria-label", "Lire à voix haute");
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
    document.querySelectorAll(".scenario-card").forEach((card) => {
      const heading = card.querySelector("h2");
      addSpeechButton(heading, () => `${heading.textContent}. ${card.querySelector("p").textContent}`);
    });
    const statsTitle = document.getElementById("stats-title");
    addSpeechButton(statsTitle, () => statsTitle.textContent);
    gameContent.querySelectorAll(".detail-subject, .coach-message h1, .ending h3, .search-result h2, .attachment-debrief h2").forEach((heading) => {
      addSpeechButton(heading, () => heading.textContent);
    });
    gameContent.querySelectorAll(".detail-body, .coach-message .coach-body, .feedback, .search-simulated").forEach((content) => {
      addSpeechButton(content, () => {
        const readableContent = content.cloneNode(true);
        readableContent.querySelectorAll("button, .link-inspector, .attachment-debrief[hidden]").forEach((control) => control.remove());
        return readableContent.textContent.replace(/\s+/g, " ").trim();
      });
    });
  }

  document.addEventListener("pointermove", (event) => {
    if (!preferences.ruler) return;
    readingRuler.style.top = `${Math.max(0, event.clientY - 22)}px`;
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
    details.hidden = true;
    details.setAttribute("role", "status");
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
    updateSpeechControls();
  }

  new MutationObserver(enhanceMessage).observe(gameContent, { childList: true, subtree: true });
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
