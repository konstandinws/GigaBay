import AuctionService from "./services/auction.service.js";
import { API_BASE_URL } from "./api/client.js";

let allAuctions = [];
let timerInterval = null;
let currentPage = 1;
const LIMIT = 12; // Nombre d'enchères par chargement
let isFilterActive = false;

function getRemainingTime(endDate) {
  const total = Date.parse(endDate) - Date.parse(new Date());
  if (total <= 0) {
      return { total, text: "Terminé", isFinished: true };
  }
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  let text = "";
  if (days > 0) text += `${days}j `;
  text += `${hours}h ${minutes}m ${seconds}s`;
  return { total, text, isFinished: false };
}

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

// MODIFICATION : Ajout du paramètre 'append' pour savoir si on ajoute ou remplace
function displayAuctions(list, append = false) {
  const container = document.getElementById("auctions-list");
  
  // Si on n'est pas en mode "ajout", on vide le conteneur
  if (!append) {
      container.innerHTML = "";
  }

  if ((!list || list.length === 0) && !append) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><p>Aucune enchère trouvée.</p></div>`;
    return;
  }

  list.forEach((auction) => {
    const card = document.createElement("div");
    card.className = "card auction-card";
    
    card.style.cursor = "pointer";
    card.addEventListener("click", (event) => {
        if (event.target.classList.contains('carousel-btn')) return;
        window.location.href = `/auction?id=${auction.id}`;
    });

    // --- CARROUSEL ---
    let imagesList = [];
    if (auction.images && auction.images.length > 0) {
        imagesList = auction.images.map(filename => `/uploads/${filename}`);
    } else if (auction.image_url) {
        const siteUrl = API_BASE_URL.replace("/api", "");
        imagesList = [siteUrl + auction.image_url];
    }

    let carouselHtml = '';
    if (imagesList.length === 0) {
        carouselHtml = `<div class="card-image-container" style="display:flex;align-items:center;justify-content:center;color:#888;">Pas d'image</div>`;
    } else {
        const imgsHtml = imagesList.map((src, index) => 
            `<img src="${src}" class="${index === 0 ? 'active' : ''}" alt="${auction.title}">`
        ).join("");
        
        const arrowsHtml = imagesList.length > 1 ? `
            <button class="carousel-btn prev" onclick="moveSlide(this, -1)">‹</button>
            <button class="carousel-btn next" onclick="moveSlide(this, 1)">›</button>
        ` : '';

        carouselHtml = `
            <div class="card-image-container" data-total="${imagesList.length}">
                ${imgsHtml}
                ${arrowsHtml}
            </div>
        `;
    }

    // --- PRIX & BADGES ---
    const currentPrice = parseFloat(auction.current_price);
    const startPrice = parseFloat(auction.starting_price);
    const isBiddingStarted = currentPrice > startPrice;
    const badgeText = isBiddingStarted ? `Enchère : ${currentPrice} €` : `Mise à prix : ${startPrice} €`;
    const badgeClass = isBiddingStarted ? "auction-badge" : "auction-badge starting";

    const timeInfo = getRemainingTime(auction.end_date);

    card.innerHTML = `
        ${carouselHtml}
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

  startCountdown();
}

window.moveSlide = function(btn, direction) {
    event.stopPropagation();
    const container = btn.closest(".card-image-container");
    const images = container.querySelectorAll("img");
    let activeIndex = 0;
    images.forEach((img, index) => {
        if (img.classList.contains("active")) {
            activeIndex = index;
            img.classList.remove("active");
        }
    });
    let newIndex = activeIndex + direction;
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    images[newIndex].classList.add("active");
};

// MODIFICATION : Nouvelle fonction de chargement avec pagination
async function loadAuctions(page) {
    const btn = document.getElementById("load-more-btn");
    
    try {
        // Appel API avec page et limite
        const response = await AuctionService.getAll(page, LIMIT);
        const newAuctions = response.data || [];

        if (page === 1) {
            allAuctions = newAuctions;
            displayAuctions(newAuctions, false); // Remplace tout
        } else {
            allAuctions = [...allAuctions, ...newAuctions]; // Ajoute à la suite
            displayAuctions(newAuctions, true); // Mode "append" activé
        }

        // Gestion de l'affichage du bouton "Charger plus"
        if (btn) {
            if (newAuctions.length < LIMIT) {
                btn.style.display = "none"; // Plus rien à charger
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
    // 1. Chargement initial de la page 1
    loadAuctions(currentPage);

    // 2. Écouteur sur le bouton "Charger plus"
    const btn = document.getElementById("load-more-btn");
    if(btn){
        btn.addEventListener("click", () => {
            currentPage++;
            loadAuctions(currentPage);
        });
    }

    // 3. Filtres Catégories
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach((card) => {
        card.addEventListener("click", () => {
            // On cache le bouton "Charger plus" quand on filtre pour simplifier
            const loadMoreBtn = document.getElementById("load-more-btn");
            if(loadMoreBtn) loadMoreBtn.style.display = "none";
            
            isFilterActive = true;

            categoryCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            
            const category = (card.dataset.category || "").toLowerCase();
            
            if (!category) {
                // Si on désélectionne, on pourrait vouloir recharger la pagination, 
                // mais ici on affiche simplement tout ce qu'on a déjà chargé.
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