import AuctionService from "./services/auction.service";

document.addEventListener("DOMContentLoaded", function () {
  
  // faire un fonctionne generale pour avoir le token
  const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
      return;
    }

  const form = document.getElementById("new-auction-form");
  const errorEl = document.getElementById("auction-error");
  const successEl = document.getElementById("auction-success");

  const titleInput = document.getElementById("auction-title");
  const descInput = document.getElementById("auction-description");
  const priceInput = document.getElementById("auction-price");
  const endDateInput = document.getElementById("auction-end-date");
  const imagesInput = document.getElementById("auction-images");


  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorEl.textContent = "";
    successEl.textContent = "";

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



      const created = data.data; // { id, title, ... }

      const createdAuction = response.data

      const files = Array.from(imagesInput.files || []);
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("images", file); // "images" = name attendu par multer
        });

        await AuctionService.uploadImages(createdAuction.id, formData);
      }

      successEl.textContent = "Annonce créée avec succès !";
      form.reset();
      
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
});
