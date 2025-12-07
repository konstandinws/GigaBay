import AuctionService from "./services/auction.service.js";
import { API_BASE_URL } from "./api/client.js";

let allAuctions = [];
let timerInterval = null;

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
            
            // Gestion de la couleur du texte
            if (timeData.isFinished) {
                el.style.color = "#e53935"; // Rouge
                el.style.fontWeight = "bold";
            } else if (timeData.total < 3600000) { 
                el.style.color = "#d32f2f"; // Orange si < 1h
            }
        });
    }, 1000);
}

function displayAuctions(list) {
  const container = document.getElementById("auctions-list");
  container.innerHTML = "";

  if (!list || list.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><p>Aucune enchère trouvée.</p></div>`;
    return;
  }

  list.forEach((auction) => {
    const card = document.createElement("div");
    card.className = "card auction-card";
    
    // === RENDRE LA CARTE CLIQUABLE ===
    card.style.cursor = "pointer";
    card.addEventListener("click", (event) => {
        // Si on clique sur une flèche du carrousel, on ne change pas de page
        if (event.target.classList.contains('carousel-btn')) return;
        
        // Sinon, redirection vers la page détail
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

    // --- HTML DE LA CARTE ---
    // J'ai retiré le <button> du footer et j'ai centré le timer.
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

// Fonction Slider (Globale)
window.moveSlide = function(btn, direction) {
    event.stopPropagation(); // Empêche le clic de rediriger
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

async function loadAllAuctions() {
    try {
        const response = await AuctionService.getAll();
        allAuctions = response.data || [];
        displayAuctions(allAuctions);
    } catch (err) {
        console.error("Erreur chargement:", err);
        document.getElementById("auctions-list").innerHTML = `<p class="error">Impossible de charger les enchères.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadAllAuctions();

    // Filtres Catégories
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach((card) => {
        card.addEventListener("click", () => {
            categoryCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            const category = (card.dataset.category || "").toLowerCase();
            if (!category) {
                displayAuctions(allAuctions);
            } else {
                const filtered = allAuctions.filter(a => {
                    const content = (a.title + " " + (a.description || "")).toLowerCase();
                    return content.includes(category);
                });
                displayAuctions(filtered);
            }
        });
    });
});