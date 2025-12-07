import AuctionService from "./services/auction.service.js"; 

let allAuctions = []; // toutes les enchères récupérées

// format HH:MM:SS à partir de end_date
function formatTime(endDate) {
  const d = new Date(endDate);
  if (isNaN(d.getTime())) return endDate || "";
  return d.toLocaleTimeString("fr-FR", { hour12: false });
}

// affiche une liste d'enchères dans les cartes
function displayAuctions(list) {
  const container = document.getElementById("auctions-list");
  container.innerHTML = "";

  if (!list || list.length === 0) {
    container.innerHTML = "<p>Aucune enchère trouvée.</p>";
    return;
  }

  list.forEach((a) => {
    const card = document.createElement("div");
    card.className = "card auction-card";

    // IMAGE
    if (a.image_url) {
      const img = document.createElement("img");
      img.src = API_BASE_URL + a.image_url;
      img.alt = a.title;
      card.appendChild(img);
    }

    // BADGE (enchère de départ / plus élevée)
    const badge = document.createElement("div");
    badge.className = "auction-badge";

    const highest = Number(a.current_price) > Number(a.starting_price);
    if (highest) {
      badge.textContent = "Enchère la plus élevée € " + a.current_price;
    } else {
      badge.textContent = "Enchère de départ € " + a.starting_price;
    }
    card.appendChild(badge);

    // CORPS
    const body = document.createElement("div");
    body.className = "auction-body";

    // Titre
    const title = document.createElement("div");
    title.className = "auction-title";
    title.textContent = a.title;
    body.appendChild(title);

    // Numéro de lot (on utilise l'id comme numéro de lot)
    const lotRow = document.createElement("div");
    lotRow.className = "auction-lot-row";

    const lineLeft = document.createElement("div");
    lineLeft.className = "auction-lot-line";
    const lineRight = document.createElement("div");
    lineRight.className = "auction-lot-line";

    const lotBox = document.createElement("div");
    lotBox.className = "auction-lot-box";
    lotBox.textContent = "Numéro de lot: " + a.id;

    lotRow.appendChild(lineLeft);
    lotRow.appendChild(lotBox);
    lotRow.appendChild(lineRight);
    body.appendChild(lotRow);

    // Nombre d'enchères (si un jour tu ajoutes bids_count côté API)
    const bidsP = document.createElement("p");
    bidsP.className = "auction-bids";
    const nbBids = a.bids_count != null ? a.bids_count : 0;
    bidsP.textContent = "Nombre d'enchères: " + nbBids;
    body.appendChild(bidsP);

    card.appendChild(body);

    // FOOTER : heure + bouton Enchérir
    const footer = document.createElement("div");
    footer.className = "card-footer";

    const timeDiv = document.createElement("div");
    timeDiv.className = "auction-time";

    const clock = document.createElement("div");
    clock.className = "auction-clock-icon";
    clock.textContent = "⏱";

    const timeText = document.createElement("span");
    timeText.textContent = formatTime(a.end_date);

    timeDiv.appendChild(clock);
    timeDiv.appendChild(timeText);

    const bidBtn = document.createElement("button");
    bidBtn.textContent = "Enchérir";
    bidBtn.addEventListener("click", async function () {
  const token = getToken();

  if (!token) {
    // Pas connecté → redirection login
    window.location.href =
      "login.html?auctionId=" + encodeURIComponent(a.id);
    return;
  }

  // Demander le montant
  const input = prompt(
    `Montant de votre enchère en € (prix actuel : ${a.current_price} €) :`
  );
  if (input === null) return; // Annulé

  const amount = parseFloat(input.replace(",", "."));
  if (isNaN(amount)) {
    alert("Montant invalide.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auctions/${a.id}/bids`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ amount }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de la mise.");
    }

    alert("Enchère placée avec succès !");
    // Met à jour le prix affiché sur la carte
    a.current_price = data.data.newPrice;
    // (au besoin tu peux re-render toute la liste avec displayAuctions(allAuctions))
    displayAuctions(allAuctions);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});


    footer.appendChild(timeDiv);
    footer.appendChild(bidBtn);
    card.appendChild(footer);

    container.appendChild(card);
  });
}

// chargement initial + filtres catégories
document.addEventListener("DOMContentLoaded", async () => {
  const errorEl = document.getElementById("error-message");

  try {
    const response = await AuctionService.getAll();

    if (!response.ok) {
      throw new Error(data.message || "Erreur API");
    }

    allAuctions = data.data || [];
    displayAuctions(allAuctions);

    // Gestion du filtrage par catégories (si la section existe)
    const categoryCards = document.querySelectorAll(".category-card");

    categoryCards.forEach((card) => {
      card.addEventListener("click", () => {
        const category = (card.dataset.category || "").toLowerCase();

        // visuel "active"
        categoryCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");

        if (!category) {
          displayAuctions(allAuctions);
          return;
        }

        const filtered = allAuctions.filter((a) => {
          const txt = (a.title + " " + (a.description || "")).toLowerCase();
          return txt.includes(category);
        });

        displayAuctions(filtered);
      });
    });
  } catch (err) {
    console.error(err);
    if (errorEl) errorEl.textContent = err.message;
  }
});
