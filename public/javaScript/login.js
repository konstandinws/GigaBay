// js/login.js

const API_BASE_URL = "http://localhost:3000"; // adapte si besoin

// juste pour vérifier que le fichier est bien chargé
console.log("✅ login.js chargé");

function getAuctionIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("auctionId");
}

const form = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const errorEl = document.getElementById("login-error");

form.addEventListener("submit", async function (e) {
  e.preventDefault(); // ⚠️ empêche le rechargement de la page
  errorEl.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const response = await fetch(API_BASE_URL + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Email ou mot de passe incorrect");
    }

    // on stocke user + token
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);

    const auctionId = getAuctionIdFromUrl();
    if (auctionId) {
      window.location.href =
        "index.html?auctionId=" + encodeURIComponent(auctionId);
    } else {
      window.location.href = "index.html";
    }
  } catch (err) {
    errorEl.textContent = err.message;
  }
});
