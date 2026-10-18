(() => {
  const gameContent = document.getElementById("game-content");
  const profileBadge = document.getElementById("profile-badge");
  const accessibilityStatus = document.getElementById("accessibility-status");
  const readButton = document.getElementById("read-instructions");
  const destinations = {
    SP: "https://ameli.fr.com-support-secu.tk.invalid/verification",
    JD: "https://discord.com-support-secu.tk.invalid/recompense",
    PR: "https://rh-partage.com-support-secu.tk.invalid/document"
  };

  document.getElementById("accessibility-toggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const options = document.getElementById("accessibility-options");
    const expanded = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(expanded));
    options.hidden = !expanded;
  });

  document.getElementById("large-text-toggle").addEventListener("click", (event) => {
    const enabled = document.body.classList.toggle("large-text");
    event.currentTarget.setAttribute("aria-pressed", String(enabled));
    accessibilityStatus.textContent = enabled ? "Le texte est agrandi." : "La taille du texte est normale.";
  });

  document.getElementById("contrast-toggle").addEventListener("click", (event) => {
    const enabled = document.body.classList.toggle("high-contrast");
    event.currentTarget.setAttribute("aria-pressed", String(enabled));
    accessibilityStatus.textContent = enabled ? "Le fort contraste est activé." : "Le fort contraste est désactivé.";
  });

  function stopReading(message) {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    readButton.setAttribute("aria-pressed", "false");
    readButton.textContent = "Lire les consignes";
    if (message) accessibilityStatus.textContent = message;
  }

  readButton.addEventListener("click", () => {
    if (readButton.getAttribute("aria-pressed") === "true") {
      stopReading("La lecture audio est arrêtée.");
      return;
    }
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance !== "function") {
      accessibilityStatus.textContent = "La lecture audio n’est pas disponible dans ce navigateur.";
      return;
    }

    const instructions = [
      document.querySelector(".home-intro p").textContent,
      ...Array.from(document.querySelectorAll(".scenario-card"), (card) =>
        `${card.querySelector("h2").textContent}. ${card.querySelector("p").textContent}`
      ),
      "Prends le temps de vérifier l’adresse de l’expéditeur et la destination des liens. N’ouvre pas une pièce jointe inattendue."
    ].join(" ");
    const utterance = new SpeechSynthesisUtterance(instructions);
    utterance.lang = "fr-FR";
    utterance.onend = () => stopReading("La lecture des consignes est terminée.");
    utterance.onerror = () => {
      if (readButton.getAttribute("aria-pressed") === "true") {
        stopReading("La lecture audio a rencontré un problème.");
      }
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    readButton.setAttribute("aria-pressed", "true");
    readButton.textContent = "Arrêter la lecture";
    accessibilityStatus.textContent = "Lecture des consignes en cours.";
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-scenario]") && readButton.getAttribute("aria-pressed") === "true") {
      stopReading("La lecture audio est arrêtée.");
    }
  });

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
