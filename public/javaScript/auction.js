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
        
        // On affiche les infos
        renderPage(auction);
        
        // On active le système d'enchère
        setupBidSystem(auction);

    } catch (err) {
        console.error(err);
        document.querySelector("main").innerHTML = `
            <div class="error" style="text-align:center; padding:50px;">
                <h2>Impossible de charger l'enchère</h2>
                <p>${err.message}</p>
                <a href="/">Retour à l'accueil</a>
            </div>`;
    }
});

function renderPage(auction) {
    // Textes de base
    document.title = auction.title; // Change le titre de l'onglet
    document.getElementById("auction-title").textContent = auction.title;
    document.getElementById("auction-description").textContent = auction.description || "Aucune description fournie.";
    
    updatePriceDisplay(auction.current_price);

    // Gestion des Images (Galerie)
    setupGallery(auction);

    // Lancement du Timer
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
    
    // URL de base (on retire /api car les images sont dans /uploads à la racine)
    const siteUrl = API_BASE_URL.replace("/api", "");

    // On construit la liste des images
    // Note : Si ton backend getOne ne renvoie pas encore le tableau 'images', 
    // on utilise image_url comme fallback.
    let imagesList = [];
    if (auction.images && auction.images.length > 0) {
        imagesList = auction.images.map(filename => `${siteUrl}/uploads/${filename}`);
    } else if (auction.image_url) {
        imagesList = [`${siteUrl}${auction.image_url}`];
    } else {
        imagesList = ["/img/default-placeholder.png"]; // Image par défaut si rien
    }

    // 1. Afficher l'image principale
    mainImg.src = imagesList[0];

    // 2. Générer les miniatures (seulement s'il y a plus d'une image)
    thumbContainer.innerHTML = "";
    if (imagesList.length > 1) {
        imagesList.forEach((src) => {
            const thumb = document.createElement("img");
            thumb.src = src;
            thumb.style.cssText = "width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: border 0.2s;";
            
            // Interaction au clic
            thumb.addEventListener("click", () => {
                mainImg.src = src;
                // Visuel de sélection (optionnel)
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
        const timeData = getRemainingTime(endDateStr); // Utilisation de l'utilitaire

        timerEl.textContent = timeData.text;

        if (timeData.isFinished) {
            timerEl.style.color = "#e53935";
            disableBidding();
        } else if (timeData.total < 3600000) {
             timerEl.style.color = "#d32f2f"; // Orange si moins d'1h
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

// --- LOGIQUE D'ENCHÈRE ---

function setupBidSystem(auction) {
    const btn = document.getElementById("btn-place-bid");
    const input = document.getElementById("bid-amount");
    const errorEl = document.getElementById("bid-error");
    const successEl = document.getElementById("bid-success");

    // Pré-remplir le placeholder avec le montant minimum (Prix actuel + 1€)
    input.placeholder = `Min: ${(auction.current_price + 1).toFixed(2)} €`;

    btn.addEventListener("click", async () => {
        // Reset messages
        errorEl.textContent = "";
        successEl.textContent = "";

        // 1. Vérification Connexion
        const user = AuthService.getCurrentUser();
        if (!user) {
            // Sauvegarde l'URL actuelle pour revenir après le login
            const currentUrl = window.location.pathname + window.location.search;
            window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
            return;
        }

        // 2. Validation Montant
        const amount = parseFloat(input.value);
        // Note: On peut aussi vérifier si c'est la propre enchère de l'utilisateur ici
        
        if (isNaN(amount) || amount <= auction.current_price) {
            errorEl.textContent = "Votre offre doit être supérieure au prix actuel.";
            return;
        }

        try {
            // 3. Appel API
            const response = await AuctionService.placeBid(auctionId, amount);
            
            // 4. Succès
            successEl.textContent = "Enchère placée avec succès !";
            input.value = ""; // Vider le champ
            
            // Mise à jour immédiate du prix sur la page sans recharger
            auction.current_price = amount; 
            updatePriceDisplay(amount);
            
            // Mise à jour du placeholder pour la prochaine enchère
            input.placeholder = `Min: ${(amount + 1).toFixed(2)} €`;

        } catch (err) {
            console.error(err);
            errorEl.textContent = err.message || "Erreur lors de l'enchère.";
        }
    });
}