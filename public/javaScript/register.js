// js/register.js

const API_BASE_URL = "http://localhost:3000";

console.log("register.js chargé");

function getAuctionIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("auctionId");
}

const form = document.getElementById("register-form");
const usernameInput = document.getElementById("reg-username");
const emailInput = document.getElementById("reg-email");
const passwordInput = document.getElementById("reg-password");
const errorEl = document.getElementById("register-error");
const successEl = document.getElementById("register-success");
const goLoginLink = document.getElementById("go-login-link");

const auctionId = getAuctionIdFromUrl();
if (auctionId) {
  goLoginLink.href =
    "login.html?auctionId=" + encodeURIComponent(auctionId);
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  errorEl.textContent = "";
  successEl.textContent = "";

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const response = await fetch(API_BASE_URL + "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'inscription");
    }

    successEl.textContent =
      "Compte créé avec succès, tu peux te connecter.";

    setTimeout(() => {
      if (auctionId) {
        window.location.href =
          "login.html?auctionId=" + encodeURIComponent(auctionId);
      } else {
        window.location.href = "login.html";
      }
    }, 800);
  } catch (err) {
    errorEl.textContent = err.message;
  }
});
