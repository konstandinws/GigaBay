import AuthService from "./services/auth.service.js";
import AuctionService from "./services/auction.service.js";
import { API_BASE_URL } from "./api/client.js";
import { loadLayout } from "./components/layout.js";

document.addEventListener("DOMContentLoaded", async () => {

    loadLayout();

    // Vérification Connexion
    const user = AuthService.getCurrentUser();

    // Remplissage des infos (textContent est safe par défaut)
    const nameEl = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");
    
    if (nameEl) nameEl.textContent = user.username || "Utilisateur";
    if (emailEl) emailEl.textContent = user.email || "";

    // Gestion Déconnexion
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            AuthService.logout();
        });
    }

    // Initialisation
    initTabs();
    loadMyAuctions(user.id);
});

function initTabs() {
    const triggers = document.querySelectorAll(".tab-trigger");
    triggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            document.querySelectorAll(".tab-trigger").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            trigger.classList.add("active");
            const targetId = trigger.dataset.target;
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add("active");
        });
    });
}

async function loadMyAuctions(userId) {
    const container = document.getElementById("created-auctions-list");
    if (!container) return;
    
    // On vide le conteneur proprement
    container.innerHTML = "";

    try {
        const response = await AuctionService.getAll();
        const allAuctions = response.data || [];
        const myAuctions = allAuctions.filter(a => a.user_id === userId);

        if (myAuctions.length === 0) {
            container.textContent = "Vous n'avez aucune enchère en cours.";
            container.className = "empty-state";
            return;
        }

        // --- CONSTRUCTION SÉCURISÉE DU DOM ---
        myAuctions.forEach(auction => {
            const card = document.createElement("div");
            card.className = "auction-item"; // J'ai adapté la classe au CSS profile.css (auction-item)

            // 1. Image
            const img = document.createElement("img");
            if (auction.images && auction.images.length > 0) {
                img.src = `/uploads/${auction.images[0]}`;
            } else if (auction.image_url) {
                img.src = API_BASE_URL.replace("/api", "") + auction.image_url;
            } else {
                img.src = "/img/default-placeholder.png";
            }
            img.alt = auction.title; // Safe

            // 2. Infos
            const infoDiv = document.createElement("div");
            infoDiv.className = "auction-info";

            const title = document.createElement("h4");
            title.textContent = auction.title; // XSS Bloqué ici

            const priceDiv = document.createElement("div");
            priceDiv.textContent = `Prix : ${auction.current_price} €`;
            priceDiv.style.fontSize = "0.9rem";
            priceDiv.style.color = "#666";

            const dateDiv = document.createElement("div");
            const date = new Date(auction.end_date).toLocaleDateString();
            dateDiv.textContent = `Fin le : ${date}`;
            dateDiv.style.fontSize = "0.8rem";
            dateDiv.style.color = "#999";

            infoDiv.append(title, priceDiv, dateDiv);

            // 3. Actions (Bouton Modifier)
            const actionDiv = document.createElement("div");
            
            const editBtn = document.createElement("button");
            editBtn.className = "btn-outline";
            editBtn.textContent = "Voir / Modifier";
            editBtn.style.fontSize = "0.8rem";
            editBtn.onclick = () => {
                // Redirection vers la page détail (ou une page edit si tu en as une)
                window.location.href = `/auction?id=${auction.id}`;
            };

            actionDiv.appendChild(editBtn);

            // Assemblage
            card.append(img, infoDiv, actionDiv);
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.textContent = "Erreur lors du chargement des enchères.";
        container.style.color = "red";
    }
}