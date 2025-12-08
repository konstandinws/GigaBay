import AuthService from "./services/auth.service.js";
import AuctionService from "./services/auction.service.js";
import { API_BASE_URL } from "./api/client.js";
import { loadLayout } from "./components/layout.js";

document.addEventListener("DOMContentLoaded", async () => {

    loadLayout();

    // Vérification Connexion
    const user = AuthService.getCurrentUser();

    // Remplissage des infos (Avec les bons IDs du nouveau HTML)
    const nameEl = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");
    
    // On vérifie que les éléments existent pour éviter les erreurs
    if (nameEl) nameEl.textContent = user.username || "Utilisateur";
    if (emailEl) emailEl.textContent = user.email || "";

    // Gestion Déconnexion (Via le Service)
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            AuthService.logout();
        });
    }

    // Initialisation des Onglets et Chargement des enchères
    initTabs();
    loadMyAuctions(user.id);
});

// --- FONCTIONS UTILITAIRES ---

function initTabs() {
    const triggers = document.querySelectorAll(".tab-trigger");
    triggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            // Retire la classe active partout
            document.querySelectorAll(".tab-trigger").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            // Active l'élément cliqué
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
    
    try {
        const response = await AuctionService.getAll();
        const allAuctions = response.data || [];
        
        // Filtre : Uniquement mes enchères
        const myAuctions = allAuctions.filter(a => a.user_id === userId);

        if (myAuctions.length === 0) {
            container.innerHTML = `<div class="empty-state">Vous n'avez aucune enchère en cours.</div>`;
            return;
        }

        // Génération HTML
        container.innerHTML = myAuctions.map(auction => {
            const imageUrl = auction.image_url 
                ? API_BASE_URL.replace("/api", "") + auction.image_url 
                : "/img/default-placeholder.png"; // Image par défaut si besoin

            return `
            <div class="auction-card">
                <img src="${imageUrl}" alt="${auction.title}" class="auction-image">
                
                <div class="auction-details">
                    <h3>${auction.title}</h3>
                    <div class="auction-price">Prix : ${auction.current_price} €</div>
                    <div class="auction-time">
                        Fin le : ${new Date(auction.end_date).toLocaleDateString()}
                    </div>
                </div>

                <div class="auction-actions">
                    <button class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                        Modifier
                    </button>
                </div>
            </div>
            `;
        }).join("");

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="empty-state" style="color:red;">Erreur lors du chargement des enchères.</div>`;
    }
}