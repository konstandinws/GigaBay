import AuctionService from "./services/auction.service.js";
import AuthService from "./services/auth.service.js";
import { loadLayout } from "./components/layout.js";

document.addEventListener("DOMContentLoaded", async function () {
  loadLayout();
  
  // Récupération des éléments
  const form = document.getElementById("new-auction-form");
  const pageTitle = document.querySelector("h2");
  const btnSubmit = document.querySelector("button[type='submit']");
  const errorEl = document.getElementById("auction-error");
  const successEl = document.getElementById("auction-success");

  // Inputs
  const titleInput = document.getElementById("auction-title");
  const descInput = document.getElementById("auction-description");
  const priceInput = document.getElementById("auction-price");
  const endDateInput = document.getElementById("auction-end-date");
  const imagesInput = document.getElementById("auction-images");

  // Vérification du mode : Est-ce qu'on a un ID dans l'URL ?
  const params = new URLSearchParams(window.location.search);
  const auctionId = params.get("id");
  const isEditMode = !!auctionId;

  // --- INITIALISATION ---
  if (isEditMode) {
      // MODE MODIFICATION
      pageTitle.textContent = "Modifier l'annonce";
      btnSubmit.textContent = "Enregistrer les modifications";
      await loadAuctionData(auctionId);
  } else {
      // MODE CRÉATION (Restauration localStorage si besoin)
      restoreDraft();
  }

  // --- GESTION DU RETOUR ---
  document.getElementById("returnBtn").addEventListener("click", (e)=>{
    e.preventDefault();
    localStorage.removeItem("auction_data");
    // Si on modifie, on retourne à la page de l'enchère, sinon accueil
    window.location.href = isEditMode ? `/auction?id=${auctionId}` : "/";
  });

  // --- SOUMISSION DU FORMULAIRE ---
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorEl.textContent = "";
    successEl.textContent = "";

    const user = AuthService.getCurrentUser();
    if (!user) {
        saveDraft();
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
    }

    // Validation
    const title = titleInput.value.trim();
    const price = parseFloat(priceInput.value);
    
    if (!title || isNaN(price)) {
      errorEl.textContent = "Le titre et le prix sont obligatoires.";
      return;
    }

    const payload = {
      title,
      price,
      description: descInput.value.trim(),
      end_date: new Date(endDateInput.value).toISOString()
    };

    try {
      if (isEditMode) {
          // --- MISE À JOUR ---
          await AuctionService.update(auctionId, payload);
          successEl.textContent = "Annonce modifiée avec succès !";
          // Redirection après 1 seconde
          setTimeout(() => {
              window.location.href = `/auction?id=${auctionId}`;
          }, 1000);

      } else {
          // --- CRÉATION ---
          const response = await AuctionService.create(payload);
          const newId = response.data.id;
          
          // Gestion des images (seulement à la création ou ajout en modif)
          await handleImages(newId);
          
          localStorage.removeItem("auction_data");
          successEl.textContent = "Annonce créée avec succès !";
          form.reset();
      }
      
      // En mode édition, on peut aussi permettre d'ajouter des images
      if (isEditMode && imagesInput.files.length > 0) {
          await handleImages(auctionId);
      }

    } catch (err) {
      console.error(err);
      errorEl.textContent = err.message || "Une erreur est survenue.";
    }
  });

  // --- FONCTIONS UTILITAIRES ---

  async function loadAuctionData(id) {
      try {
          const auction = await AuctionService.getOne(id);
          
          // Vérification propriétaire (sécurité front)
          const user = AuthService.getCurrentUser();
          if (user && user.id !== auction.user_id) {
              alert("Vous n'avez pas le droit de modifier cette enchère.");
              window.location.href = "/";
              return;
          }

          titleInput.value = auction.title;
          descInput.value = auction.description;

          priceInput.value = auction.starting_price;
          priceInput.disabled = true; // Empêche la modification
          priceInput.title = "Le prix de départ ne peut pas être modifié"; // Info bulle
          priceInput.style.backgroundColor = "#e9ecef"; // Visuel "grisé"
          

              endDateInput.disabled = true; // Empêche la modification
              endDateInput.title = "La date de fin ne peut pas être modifiée";
              endDateInput.style.backgroundColor = "#e9ecef";


      } catch (err) {
          errorEl.textContent = "Impossible de charger les données de l'enchère.";
      }
  }

  async function handleImages(id) {
      const files = Array.from(imagesInput.files || []);
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));
        await AuctionService.uploadImages(id, formData);
      }
  }

  function saveDraft() {
      const donnees = {
          title: titleInput.value,
          description: descInput.value,
          price: priceInput.value,
          endDate: endDateInput.value
      };
      localStorage.setItem("auction_data", JSON.stringify(donnees));
  }

  function restoreDraft() {
      const donneesEcrites = localStorage.getItem("auction_data");
      if (donneesEcrites) {
          const data = JSON.parse(donneesEcrites);
          titleInput.value = data.title || "";
          descInput.value = data.description || "";
          priceInput.value = data.price || "";
          endDateInput.value = data.endDate || "";   
      }
  }
});