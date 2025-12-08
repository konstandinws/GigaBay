import AuctionService from "./services/auction.service.js";
import { API_BASE_URL } from "./api/client.js";
import { getRemainingTime } from "./utils/date.js"; // Import de votre nouvelle fonction utilitaire
import { loadLayout } from "./components/layout.js";

let allAuctions = [];
let timerInterval = null;
let currentPage = 1;
const LIMIT = 12; // Nombre d'enchères par chargement
let isFilterActive = false;

// Lance le compte à rebours en mettant à jour le DOM chaque seconde
function startCountdown() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const timerElements = document.querySelectorAll(".live-timer");
        timerElements.forEach(el => {
            const endDate = el.dataset.end;
            const timeData = getRemainingTime(endDate); 
            el.textContent = timeData.text;
            
            // Gestion des couleurs (rouge si fini, orange si bientôt fini)
            if (timeData.isFinished) {
                el.style.color = "#e53935"; 
                el.style.fontWeight = "bold";
            } else if (timeData.total < 3600000) { 
                el.style.color = "#d32f2f"; 
            }
        });
    }, 1000);
}

// Affiche les enchères dans le DOM
// append = true signifie qu'on ajoute à la suite (pour le bouton "Charger plus")
function displayAuctions(list, append = false) {
  const container = document.getElementById("auctions-list");
  
  // Si on remplace tout (pas d'append), on vide d'abord le conteneur
  if (!append) {
      container.innerHTML = "";
  }

  // Gestion du cas vide
  if ((!list || list.length === 0) && !append) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><p>Aucune enchère trouvée.</p></div>`;
    return;
  }

  list.forEach((auction) => {
    const card = document.createElement("div");
    card.className = "card auction-card";
    card.style.cursor = "pointer";
    
    // Redirection au clic
    card.addEventListener("click", () => {
        window.location.href = `/auction?id=${auction.id}`;
    });

    // --- GESTION IMAGE (Simplifiée : on prend la 1ère image dispo) ---
    let imageUrl = "/img/default-placeholder.png"; 
    
    if (auction.images && auction.images.length > 0) {
        imageUrl = `/uploads/${auction.images[0]}`;
    } else if (auction.image_url) {
        const siteUrl = API_BASE_URL.replace("/api", "");
        imageUrl = siteUrl + auction.image_url;
    }

    // --- PRIX & BADGES ---
    const currentPrice = parseFloat(auction.current_price);
    const startPrice = parseFloat(auction.starting_price);
    const isBiddingStarted = currentPrice > startPrice;
    const badgeText = isBiddingStarted ? `Enchère : ${currentPrice} €` : `Mise à prix : ${startPrice} €`;
    const badgeClass = isBiddingStarted ? "auction-badge" : "auction-badge starting";

    // Calcul initial du temps pour l'affichage immédiat
    const timeInfo = getRemainingTime(auction.end_date);

    // Construction du HTML de la carte
    card.innerHTML = `
        <div style="height: 220px; overflow: hidden; background: #eee;">
            <img src="${imageUrl}" alt="${auction.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div class="${badgeClass}">${badgeText}</div>
        
        <div class="auction-body">
            <div class="auction-title">${auction.title}</div>
            <div class="auction-lot-row">
                <div class="auction-lot-line"></div>
                <div class="auction-lot-box">Lot n°${auction.id}</div>
                <div class="auction-lot-line"></div>
            </div>
        </div>

        <div class="card-footer" style="justify-content: center; padding-top: 15px; padding-bottom: 15px;">
            <div class="auction-time">
                <div class="auction-clock-icon">⏱</div>
                <span class="live-timer" data-end="${auction.end_date}">
                    ${timeInfo.text}
                </span>
            </div>
        </div>
    `;

    container.appendChild(card);
  });

  // Relance le timer dynamique
  startCountdown();
}

// Charge les enchères depuis l'API avec pagination
async function loadAuctions(page) {
    const btn = document.getElementById("load-more-btn");
    
    try {
        const response = await AuctionService.getAll(page, LIMIT);
        const newAuctions = response.data || [];

        if (page === 1) {
            allAuctions = newAuctions;
            displayAuctions(newAuctions, false); // Remplace tout (Page 1)
        } else {
            allAuctions = [...allAuctions, ...newAuctions];
            displayAuctions(newAuctions, true); // Ajoute à la suite (Page > 1)
        }

        // Gestion de la visibilité du bouton "Charger plus"
        if (btn) {
            if (newAuctions.length < LIMIT) {
                // Si on a reçu moins d'éléments que la limite, c'est qu'il n'y a plus rien après
                btn.style.display = "none";
            } else {
                btn.style.display = "inline-block";
            }
        }

    } catch (err) {
        console.error("Erreur chargement:", err);
        const container = document.getElementById("auctions-list");
        if(page === 1) container.innerHTML = `<p class="error">Impossible de charger les enchères.</p>`;
    }
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    loadLayout();

    loadAuctions(currentPage);

    // 2. Configurer le bouton "Charger plus"
    const btn = document.getElementById("load-more-btn");
    if(btn) {
        btn.addEventListener("click", () => {
            currentPage++;
            loadAuctions(currentPage);
        });
    }

    // 3. Configurer les filtres par catégorie
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach((card) => {
        card.addEventListener("click", () => {
            // On cache le bouton "charger plus" quand un filtre est actif
            const loadMoreBtn = document.getElementById("load-more-btn");
            if(loadMoreBtn) loadMoreBtn.style.display = "none";
            
            isFilterActive = true;

            // Gestion visuelle des cartes de catégorie
            categoryCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            
            const category = (card.dataset.category || "").toLowerCase();
            
            if (!category) {
                // Si on clique sur une catégorie vide ou "Tout", on réaffiche tout
                displayAuctions(allAuctions, false);
            } else {
                // Filtrage côté client sur les enchères déjà chargées
                const filtered = allAuctions.filter(a => {
                    const content = (a.title + " " + (a.description || "")).toLowerCase();
                    return content.includes(category);
                });
                displayAuctions(filtered, false);
            }
        });
    });
});