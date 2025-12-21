import AuthService from "./services/auth.service.js";
import Validator from "./utils/validator.js";
import { loadLayout } from "./components/layout.js";

document.addEventListener("DOMContentLoaded", () => {
  loadLayout();
});

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

function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  errorEl.textContent = "";
  successEl.textContent = "";

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    
    Validator.validateRegistration(username, email, password);
    
    const response = await fetch(API_BASE_URL + "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      credentials: "include"
    });


    await AuthService.register(username, email, password);

    const redirectUrl = getQueryParam("redirect");

    const auctionId = getQueryParam("auctionId");

    if(redirectUrl){
      window.location.href = redirectUrl;
    }
    else if (auctionId) {
      window.location.href =
        "/?auctionId=" + encodeURIComponent(auctionId);
    } else {
      window.location.href = "/";
    }

    localStorage.setItem("token", data.accessToken);

    successEl.textContent =
      "Compte créé avec succès, tu peux te connecter.";

    // On redirige direct vers l'accueil (ou l'enchère précédente)
    setTimeout(() => {
      if (auctionId) {
        // Retour vers l'enchère qu'on voulait voir
        window.location.href = "/auction?id=" + encodeURIComponent(auctionId);
      } else {
        // Sinon accueil
        window.location.href = "/";
      }
    }, 800);

  } catch (err) {
    errorEl.textContent = err.message;
  }
});
