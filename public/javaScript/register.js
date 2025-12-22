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
  
    await AuthService.register(username, email, password);

    successEl.textContent = "Compte créé avec succès, tu peux te connecter.";

    const redirectUrl = getQueryParam("redirect");
    const auctionIdFromUrl = getAuctionIdFromUrl();

    // On redirige direct vers l'accueil (ou l'enchère précédente)
    setTimeout(() => {
      if(redirectUrl){
        window.location.href = redirectUrl;
      }
      else if (auctionIdFromUrl) {
        window.location.href = "/auction?id=" + encodeURIComponent(auctionIdFromUrl);
      } else {
        window.location.href = "/";
      }
    }, 800);  

  } catch (err) {
    console.error(err);
    errorEl.textContent = err.message || "Erreur lors de l'inscription";
  }
});
