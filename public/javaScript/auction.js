import AuctionService from "./services/auction.service.js";
import AuthService from "./services/auth.service.js";
import { API_BASE_URL } from "./api/client.js";
import { getRemainingTime } from "./utils/date.js";
import { loadLayout } from "./components/layout.js";

const params = new URLSearchParams(window.location.search);
const auctionId = params.get("id");

if (!auctionId) {
    window.location.href = "/";
}

document.addEventListener("DOMContentLoaded", async () => {
    loadLayout();
    
    try {
        const auction = await AuctionService.getOne(auctionId);
        renderPage(auction);
        setupBidSystem(auction);

        checkOwner(auction);

    } catch (err) {
        console.error(err);
        const main = document.querySelector("main");
        main.innerHTML = ""; // On vide proprement

        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.style.textAlign = "center";
        errorDiv.style.padding = "50px";

        const title = document.createElement("h2");
        title.textContent = "Impossible de charger l'enchère";

        const message = document.createElement("p");
        message.textContent = err.message; // SAFE

        const link = document.createElement("a");
        link.href = "/";
        link.textContent = "Retour à l'accueil";

        errorDiv.append(title, message, link);
        main.appendChild(errorDiv);
    }
});



function renderPage(auction) {

    document.title = auction.title;
    document.getElementById("auction-title").textContent = auction.title;
    document.getElementById("auction-description").textContent = auction.description || "Aucune description.";
    updatePriceDisplay(auction.current_price);
    setupGallery(auction);
    startTimer(auction.end_date);
}

function updatePriceDisplay(price) {
    const formattedPrice = new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'EUR' 
    }).format(price);
    document.getElementById("current-price").textContent = formattedPrice;
}

function setupGallery(auction) {
    const mainImg = document.getElementById("main-image");
    const thumbContainer = document.getElementById("thumbnails");
    const siteUrl = API_BASE_URL.replace("/api", "");

    let imagesList = [];
    if (auction.images && auction.images.length > 0) {
        imagesList = auction.images.map(filename => `${siteUrl}/uploads/${filename}`);
    } else if (auction.image_url) {
        imagesList = [`${siteUrl}${auction.image_url}`];
    } else {
        imagesList = ["/img/default-placeholder.png"];
    }

    mainImg.src = imagesList[0];
    thumbContainer.innerHTML = "";

    if (imagesList.length > 1) {
        imagesList.forEach((src) => {
            const thumb = document.createElement("img");
            thumb.src = src;
            thumb.style.cssText = "width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: border 0.2s;";
            thumb.addEventListener("click", () => {
                mainImg.src = src;
                Array.from(thumbContainer.children).forEach(t => t.style.borderColor = "transparent");
                thumb.style.borderColor = "#7c6700";
            });
            thumbContainer.appendChild(thumb);
        });
    }
}

function startTimer(endDateStr) {
    const timerEl = document.getElementById("auction-timer");
    const update = () => {
        const timeData = getRemainingTime(endDateStr);
        timerEl.textContent = timeData.text;
        if (timeData.isFinished) {
            timerEl.style.color = "#e53935";
            disableBidding();
        } else if (timeData.total < 3600000) {
             timerEl.style.color = "#d32f2f";
        }
    };
    update(); 
    setInterval(update, 1000); 
}

function disableBidding() {
    const btn = document.getElementById("btn-place-bid");
    const input = document.getElementById("bid-amount");
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Terminé";
        btn.style.background = "#ccc";
        btn.style.cursor = "not-allowed";
    }
    if (input) input.disabled = true;
}

function setupBidSystem(auction) {
    const btn = document.getElementById("btn-place-bid");
    const input = document.getElementById("bid-amount");
    const errorEl = document.getElementById("bid-error");
    const successEl = document.getElementById("bid-success");

    input.placeholder = `Min: ${(auction.current_price + 1).toFixed(2)} €`;

    btn.addEventListener("click", async () => {
        errorEl.textContent = "";
        successEl.textContent = "";

        const user = AuthService.getCurrentUser();
        if (!user) {
            const currentUrl = window.location.pathname + window.location.search;
            window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
            return;
        }

        const amount = parseFloat(input.value);
        if (isNaN(amount) || amount <= auction.current_price) {
            errorEl.textContent = "Votre offre doit être supérieure au prix actuel.";
            return;
        }

        try {
            await AuctionService.placeBid(auctionId, amount);
            successEl.textContent = "Enchère placée avec succès !";
            input.value = ""; 
            auction.current_price = amount; 
            updatePriceDisplay(amount);
            input.placeholder = `Min: ${(amount + 1).toFixed(2)} €`;
        } catch (err) {
            console.error(err);
            errorEl.textContent = err.message || "Erreur lors de l'enchère.";
        }
    });
}

function checkOwner(auction) {
    const user = AuthService.getCurrentUser();
    
    // Si pas connecté ou si l'ID ne correspond pas, on ne fait rien
    if (!user || user.id !== auction.user_id) {
        return;
    }

    // Sinon, on injecte le bouton
    const container = document.querySelector(".auction-info-panel");
    
    // On s'assure que le conteneur est en position relative pour placer le bouton
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✏️ Modifier"; 
    
    // Style du boutonen haut à droite
    editBtn.style.position = "absolute";
    editBtn.style.top = "20px";
    editBtn.style.right = "20px";
    editBtn.style.background = "white";
    editBtn.style.border = "1px solid #ccc";
    editBtn.style.padding = "5px 10px";
    editBtn.style.borderRadius = "5px";
    editBtn.style.cursor = "pointer";
    editBtn.style.fontWeight = "bold";
    editBtn.style.color = "#333";
    editBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

    editBtn.onmouseover = () => editBtn.style.background = "#f0f0f0";
    editBtn.onmouseout = () => editBtn.style.background = "white";

    editBtn.onclick = () => {

        window.location.href = `/new-auction?id=${auction.id}`; 
    };

    container.appendChild(editBtn);
}