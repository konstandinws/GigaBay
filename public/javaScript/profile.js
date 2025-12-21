import AuthService from "./services/auth.service.js";
import AuctionService from "./services/auction.service.js";
import { API_BASE_URL } from "./api/client.js"; // Juste l'URL pour les images
import { loadLayout } from "./components/layout.js";

document.addEventListener("DOMContentLoaded", async () => {
    loadLayout();

    const user = AuthService.getCurrentUser();
    if (!user) return; 

    const nameEl = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");
    const balanceEl = document.querySelector(".balance-amount");
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) logoutBtn.addEventListener("click", () => AuthService.logout());


    // On va chercher les vraies infos en BDD via le fetch
    try {
        const response = await AuthService.getProfile(); 
        const freshUser = response.user; // On récupère l'objet user complet depuis la réponse

        // Maintenant on affiche les données 
        if(nameEl) nameEl.textContent = freshUser.username; 
        if(emailEl) emailEl.textContent = freshUser.email;
        if(balanceEl) balanceEl.textContent = `${freshUser.balance || 0} €`;

    } catch (e) { 
        console.error("Erreur chargement profil", e);
        // En cas d'erreur réseau, on peut mettre un texte par défaut ou garder le vide
        if(nameEl) nameEl.textContent = "Erreur de chargement";
    }

    // Bouton ajouter des fonds
    const addFundsBtn = document.querySelector(".balance-card button");
    if (addFundsBtn) {
        addFundsBtn.onclick = async () => {
            const amountStr = prompt("Combien voulez-vous ajouter ? (ex: 100)");
            if (!amountStr) return;

            const amount = parseFloat(amountStr);
            if (isNaN(amount) || amount <= 0) {
                alert("Montant invalide");
                return;
            }
            try {
                await AuthService.addFunds(amount);
                alert("Fonds ajoutés avec succès !");
                window.location.reload(); 
            } catch (err) {
                alert("Erreur : " + err.message);
            }
        };
    }

    initTabs();
    loadMyAuctions(user.id);
});

// --- LOGIQUE MÉTIER ---

async function loadMyAuctions(userId) {
    const container = document.getElementById("created-auctions-list");
    if (!container) return;
    
    container.innerHTML = "";

    try {
        const response = await AuctionService.getMine();
        const myAuctions = response.data || [];

        if (myAuctions.length === 0) {
            container.innerHTML = `<div class="empty-state">Vous n'avez aucune enchère en cours.</div>`;
            return;
        }

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
    const imgContainer = document.createElement("div"); 
    imgContainer.className = "img-wrapper img-wrapper-small";

    let hasImage = false;
    let imageUrl = "";
    const siteUrl = API_BASE_URL.replace("/api", "");
    
    if (auction.images?.length > 0) {
        imageUrl = `/uploads/${auction.images[0]}`;
        hasImage = true;
    } else if (auction.image_url) {
        imageUrl = siteUrl + auction.image_url;
        hasImage = true;
    }

    if (hasImage) {
        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = auction.title;
        imgContainer.appendChild(img);
    } else {
        const noTxt = document.createElement("span");
        noTxt.className = "img-placeholder-text";
        noTxt.textContent = "Aucune image";
        imgContainer.appendChild(noTxt);
    }

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
    
    // On ajoute imgContainer, pas 'img' direct
    card.append(imgContainer, infoDiv); 

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
            const content = document.getElementById(targetId);
            if(content) content.classList.add("active");
        });
    });
}