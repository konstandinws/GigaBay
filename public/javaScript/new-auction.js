// js/new-auction.js

const API_BASE_URL = "http://localhost:3000"; // adapte si besoin

function getToken() {
  return localStorage.getItem("token");
}

document.addEventListener("DOMContentLoaded", function () {
  const token = getToken();
  const form = document.getElementById("new-auction-form");
  const errorEl = document.getElementById("auction-error");
  const successEl = document.getElementById("auction-success");

  const titleInput = document.getElementById("auction-title");
  const descInput = document.getElementById("auction-description");
  const priceInput = document.getElementById("auction-price");
  const endDateInput = document.getElementById("auction-end-date");
  const imagesInput = document.getElementById("auction-images");

  // Si pas connecté → on renvoie vers login
  if (!token) {
    window.location.href = "login.html";
    return;
  }

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
      // 1. Création de l'enchère
      const res = await fetch(API_BASE_URL + "/api/auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la création de l'annonce.");
      }

      const created = data.data; // { id, title, ... }

      // 2. Upload des images si l'utilisateur en a choisi
      const files = Array.from(imagesInput.files || []);
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("images", file); // "images" = name attendu par multer
        });

        const imgRes = await fetch(
          API_BASE_URL + "/api/auctions/" + created.id + "/images",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
            },
            body: formData,
          }
        );

        const imgData = await imgRes.json();
        if (!imgRes.ok) {
          throw new Error(imgData.error || "Erreur lors de l'upload des images.");
        }
      }

      successEl.textContent = "Annonce créée avec succès !";
      form.reset();
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
});
