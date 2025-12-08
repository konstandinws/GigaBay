import AuctionService from "./services/auction.service.js";
import { API_BASE_URL } from "./api/client.js";
import { getRemainingTime } from "./utils/date.js";
import { loadLayout } from "./components/layout.js";

let allAuctions = [];
let timerInterval = null;
let currentPage = 1;
const LIMIT = 12; 
let isFilterActive = false;

function startCountdown() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const timerElements = document.querySelectorAll(".live-timer");
        timerElements.forEach(el => {
            const endDate = el.dataset.end;
            const timeData = getRemainingTime(endDate); 
            el.textContent = timeData.text;
            
            if (timeData.isFinished) {
                el.style.color = "#e53935"; 
                el.style.fontWeight = "bold";
            } else if (timeData.total < 3600000) { 
                el.style.color = "#d32f2f"; 
            }
        });
    }, 1000);
}

// Affiche les enchères Sans innerHTML
function displayAuctions(list, append = false) {
  const container = document.getElementById("auctions-list");
  
  if (!append) {
      container.innerHTML = ""; // On peut vider avec innerHTML, c'est safe
  }

  if ((!list || list.length === 0) && !append) {
    // Ici le HTML est écrit en dur par nous, donc c'est safe
    container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><p>Aucune enchère trouvée.</p></div>`;
    return;
  }

  list.forEach((auction) => {
    // 1. Création de la carte
    const card = document.createElement("div");
    card.className = "card auction-card";
    card.style.cursor = "pointer";
    
    card.addEventListener("click", () => {
        window.location.href = `/auction?id=${auction.id}`;
    });

    const imgContainer = document.createElement("div");
    imgContainer.className = "img-wrapper img-wrapper-large";
    
    let hasImage = false;
    let imageUrl = "";

    // Vérification de l'image
    if (auction.images && auction.images.length > 0) {
        imageUrl = `/uploads/${auction.images[0]}`;
        hasImage = true;
    } else if (auction.image_url) {
        const siteUrl = API_BASE_URL.replace("/api", "");
        imageUrl = siteUrl + auction.image_url;
        hasImage = true;
    }

    if (hasImage) {
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = auction.title;
        imgContainer.appendChild(img);
    } else {
        const noImageText = document.createElement("span");
        noImageText.className = "img-placeholder-text"; // <--- Classe CSS
        noImageText.textContent = "Pas d'image";
        imgContainer.appendChild(noImageText);
    }

    const currentPrice = parseFloat(auction.current_price);
    const startPrice = parseFloat(auction.starting_price);
    const isBiddingStarted = currentPrice > startPrice;
    
    const badge = document.createElement("div");
    badge.className = isBiddingStarted ? "auction-badge" : "auction-badge starting";
    badge.textContent = isBiddingStarted ? `Enchère : ${currentPrice} €` : `Mise à prix : ${startPrice} €`;

    // 4. Corps de la carte (Titre + Lot)
    const body = document.createElement("div");
    body.className = "auction-body";

    const title = document.createElement("div");
    title.className = "auction-title";
    title.textContent = auction.title; 

    const lotRow = document.createElement("div");
    lotRow.className = "auction-lot-row";

    const line1 = document.createElement("div");
    line1.className = "auction-lot-line";
    
    const lotBox = document.createElement("div");
    lotBox.className = "auction-lot-box";
    lotBox.textContent = `Lot n°${auction.id}`; 

    const line2 = document.createElement("div");
    line2.className = "auction-lot-line";

    lotRow.append(line1, lotBox, line2);
    body.append(title, lotRow);

    const footer = document.createElement("div");
    footer.className = "card-footer";
    footer.style.cssText = "justify-content: center; padding-top: 15px; padding-bottom: 15px;";

    const timeDiv = document.createElement("div");
    timeDiv.className = "auction-time";

    const icon = document.createElement("div");
    icon.className = "auction-clock-icon";
    icon.textContent = "⏱";

    const timeInfo = getRemainingTime(auction.end_date);
    const timerSpan = document.createElement("span");
    timerSpan.className = "live-timer";
    timerSpan.dataset.end = auction.end_date;
    timerSpan.textContent = timeInfo.text;

    timeDiv.append(icon, timerSpan);
    footer.appendChild(timeDiv);

    // Assemblage final
    card.append(imgContainer, badge, body, footer);
    container.appendChild(card);
  });

  startCountdown();
}

async function loadAuctions(page) {
    const btn = document.getElementById("load-more-btn");
    
    try {
        const response = await AuctionService.getAll(page, LIMIT);
        const newAuctions = response.data || [];

        if (page === 1) {
            allAuctions = newAuctions;
            displayAuctions(newAuctions, false); 
        } else {
            allAuctions = [...allAuctions, ...newAuctions];
            displayAuctions(newAuctions, true);
        }

        if (btn) {
            if (newAuctions.length < LIMIT) {
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

document.addEventListener("DOMContentLoaded", () => {
    loadLayout();
    loadAuctions(currentPage);

    const btn = document.getElementById("load-more-btn");
    if(btn) {
        btn.addEventListener("click", () => {
            currentPage++;
            loadAuctions(currentPage);
        });
    }

    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach((card) => {
        card.addEventListener("click", () => {
            const loadMoreBtn = document.getElementById("load-more-btn");
            if(loadMoreBtn) loadMoreBtn.style.display = "none";
            
            isFilterActive = true;

            categoryCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            
            const category = (card.dataset.category || "").toLowerCase();
            
            if (!category) {
                displayAuctions(allAuctions, false);
            } else {
                const filtered = allAuctions.filter(a => {
                    const content = (a.title + " " + (a.description || "")).toLowerCase();
                    return content.includes(category);
                });
                displayAuctions(filtered, false);
            }
        });
    });
});