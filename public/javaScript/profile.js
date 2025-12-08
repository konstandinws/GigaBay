import AuthService from "./services/auth.service.js";
import AuctionService from "./services/auction.service.js";
import { API_BASE_URL } from "./api/client.js";
import { loadLayout } from "./components/layout.js";

document.addEventListener("DOMContentLoaded", async () => {
    loadLayout();

    const user = AuthService.getCurrentUser();
    if (!user) return; // Sécurité

    // Remplissage infos profil
    document.getElementById("user-name").textContent = user.username || "Utilisateur";
    document.getElementById("user-email").textContent = user.email || "";

    // Bouton déconnexion
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => AuthService.logout());

    // Initialisation
    initTabs();
    loadMyAuctions(user.id);
});

// --- LOGIQUE MÉTIER ---

async function loadMyAuctions(userId) {
    const container = document.getElementById("created-auctions-list");
    if (!container) return;
    
    container.innerHTML = ""; // Reset propre

    try {
        const response = await AuctionService.getAll();
        const allAuctions = response.data || [];
        const myAuctions = allAuctions.filter(a => a.user_id === userId);

        if (myAuctions.length === 0) {
            container.innerHTML = `<div class="empty-state">Vous n'avez aucune enchère en cours.</div>`;
            return;
        }

        // Boucle propre : une ligne par carte
        myAuctions.forEach(auction => {
            const card = createAuctionCard(auction);
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="empty-state error">Erreur lors du chargement.</div>`;
    }
}

// --- VUE (Génération HTML) ---

function createAuctionCard(auction) {
    // 1. Conteneur Carte (Cliquable)
    const card = document.createElement("div");
    card.className = "auction-item";
    card.style.cursor = "pointer";
    card.title = "Voir les détails";
    card.onclick = () => window.location.href = `/auction?id=${auction.id}`;

    // 2. Image
    const img = document.createElement("img");
    const siteUrl = API_BASE_URL.replace("/api", "");
    
    if (auction.images?.length > 0) img.src = `/uploads/${auction.images[0]}`;
    else if (auction.image_url) img.src = siteUrl + auction.image_url;
    else img.src = "/img/default-placeholder.png";
    
    img.alt = auction.title;

    // 3. Infos
    const infoDiv = document.createElement("div");
    infoDiv.className = "auction-info";

    const title = document.createElement("h4");
    title.textContent = auction.title;

    const priceDiv = document.createElement("div");
    priceDiv.textContent = `Prix : ${auction.current_price} €`;
    priceDiv.style.color = "#666";
    priceDiv.style.fontSize = "0.9rem";

    const dateDiv = document.createElement("div");
    dateDiv.textContent = `Fin le : ${new Date(auction.end_date).toLocaleDateString()}`;
    dateDiv.style.color = "#999";
    dateDiv.style.fontSize = "0.8rem";

    // Assemblage
    infoDiv.append(title, priceDiv, dateDiv);
    card.append(img, infoDiv);

    return card;
}

function initTabs() {
    const triggers = document.querySelectorAll(".tab-trigger");
    triggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            document.querySelectorAll(".tab-trigger").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            trigger.classList.add("active");
            const targetId = trigger.dataset.target;
            document.getElementById(targetId)?.classList.add("active");
        });
    });
}