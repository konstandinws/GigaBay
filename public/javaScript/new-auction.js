import AuctionService from "./services/auction.service.js";
import AuthService from "./services/auth.service.js";
import { loadLayout } from "./components/layout.js";

document.addEventListener("DOMContentLoaded", function () {

  loadLayout();
  
  const form = document.getElementById("new-auction-form");
  const errorEl = document.getElementById("auction-error");
  const successEl = document.getElementById("auction-success");

  const titleInput = document.getElementById("auction-title");
  const descInput = document.getElementById("auction-description");
  const priceInput = document.getElementById("auction-price");
  const endDateInput = document.getElementById("auction-end-date");
  const imagesInput = document.getElementById("auction-images");
  
  const donneesEcrites = localStorage.getItem("auction_data");
  if (donneesEcrites) {
      const data = JSON.parse(donneesEcrites);
      titleInput.value = data.title || "";
      descInput.value = data.description || "";
      priceInput.value = data.price || "";
      endDateInput.value = data.endDate || "";   
  }


  const returnBtn = document.getElementById("returnBtn");

  returnBtn.addEventListener("click", ()=>{
    localStorage.removeItem("auction_data");
    window.location.href = "/";
  })


  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorEl.textContent = "";
    successEl.textContent = "";

    const user = AuthService.getCurrentUser();

    if (!user) {
        const donnees = {
            title: titleInput.value,
            description: descInput.value,
            price: priceInput.value,
            endDate: endDateInput.value
        };
        localStorage.setItem("auction_data", JSON.stringify(donnees));
        
        window.location.href = "/login?redirect=/new-auction"; // On lui dit de revenir ici
        return;
    }

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const price = parseFloat(priceInput.value);
    const endDateValue = endDateInput.value;

    if (!title || isNaN(price)) {
      errorEl.textContent = "Le titre et le prix sont obligatoires.";
      return;
    }

    const payload = {
      title,
      price, // starting_price côté backend
      description,
    };

    if (endDateValue) {
      payload.end_date = new Date(endDateValue).toISOString();
    }

    try {
      
      const response = await AuctionService.create(payload);

      const createdAuction = response.data

      const files = Array.from(imagesInput.files || []);
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("images", file); // "images" = name attendu par multer
        });

        await AuctionService.uploadImages(createdAuction.id, formData);
      }

      localStorage.removeItem("auction_data");

      successEl.textContent = "Annonce créée avec succès !";
      form.reset();
      
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
});
