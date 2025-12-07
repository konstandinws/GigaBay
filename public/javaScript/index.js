import AuctionService from "./services/auction.service.js";
import { API_BASE_URL } from "./api/client.js"; // <--- 1. Import ajouté

let allAuctions = [];

function formatTime(endDate) {
  const d = new Date(endDate);
  if (isNaN(d.getTime())) return endDate || "";
  return d.toLocaleTimeString("fr-FR", { hour12: false });
}

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

    // --- IMAGE ---
    if (a.image_url) {
      const img = document.createElement("img");
      // 2. Correction URL Image : On veut "localhost:3000/uploads" et pas ".../api/uploads"
      const siteUrl = API_BASE_URL.replace("/api", ""); 
      img.src = siteUrl + a.image_url;
      img.alt = a.title;
      card.appendChild(img);
    }

    // --- BADGE ---
    const badge = document.createElement("div");
    badge.className = "auction-badge";
    const highest = Number(a.current_price) > Number(a.starting_price);
    
    // Petite amélioration d'affichage
    badge.textContent = highest 
        ? `Enchère : ${a.current_price} €` 
        : `Départ : ${a.starting_price} €`;
        
    card.appendChild(badge);

    // --- CORPS ---
    const body = document.createElement("div");
    body.className = "auction-body";

    const title = document.createElement("div");
    title.className = "auction-title";
    title.textContent = a.title;
    body.appendChild(title);

    const lotRow = document.createElement("div");
    lotRow.className = "auction-lot-row";
    lotRow.innerHTML = `
        <div class="auction-lot-line"></div>
        <div class="auction-lot-box">Lot: ${a.id}</div>
        <div class="auction-lot-line"></div>
    `;
    body.appendChild(lotRow);

    const bidsP = document.createElement("p");
    bidsP.className = "auction-bids";
    bidsP.textContent = "Offres : " + (a.bids_count || 0);
    body.appendChild(bidsP);

    card.appendChild(body);

    // --- FOOTER ---
    const footer = document.createElement("div");
    footer.className = "card-footer";
    footer.innerHTML = `
        <div class="auction-time">
            <div class="auction-clock-icon">⏱</div>
            <span>${formatTime(a.end_date)}</span>
        </div>
    `;

    const bidBtn = document.createElement("button");
    bidBtn.textContent = "Enchérir";
    
    // --- ACTION ENCHÉRIR ---
    bidBtn.addEventListener("click", async function () {
      const token = localStorage.getItem("token");

      if (!token) {
        // 3. Correction lien : "/login" au lieu de "login.html"
        window.location.href = "/login?auctionId=" + encodeURIComponent(a.id);
        return;
      }

      const input = prompt(`Votre enchère (actuellement ${a.current_price} €) :`);
      if (input === null) return;

      const amount = parseFloat(input.replace(",", "."));
      if (isNaN(amount)) {
        alert("Montant invalide.");
        return;
      }

      try {
        await AuctionService.placeBid(a.id, amount);
        alert("Enchère placée avec succès !");
        window.location.reload(); 
      } catch (err) {
        console.error(err);
        alert(err.message || "Erreur lors de l'enchère");
      }
    });

    footer.appendChild(bidBtn);
    card.appendChild(footer);
    container.appendChild(card);
  });
}

// --- CHARGEMENT INITIAL ---
document.addEventListener("DOMContentLoaded", async () => {
  const errorEl = document.getElementById("error-message");

  try {
    const response = await AuctionService.getAll();
    
    // Note : On ne vérifie plus !response.ok ici car le Service renvoie directement les données
    allAuctions = response.data || [];
    displayAuctions(allAuctions);

    // Filtres Catégories
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach((card) => {
      card.addEventListener("click", () => {
        const category = (card.dataset.category || "").toLowerCase();
        
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
    if (errorEl) errorEl.textContent = "Impossible de charger les enchères.";
  }
});