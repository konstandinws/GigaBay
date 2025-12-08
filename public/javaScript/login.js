import AuthService from "./services/auth.service.js";
import { loadLayout } from "./components/layout.js";

document.addEventListener("DOMContentLoaded", () => {
  loadLayout(); 
});

function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
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
    await AuthService.login(email, password);

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
  } catch (err) {
    if (err.status === 401) {
        errorEl.textContent = "Email ou mot de passe incorrect.";
        passwordInput.value = ""; // On vide le mot de passe pour qu'il réessaie
        passwordInput.focus();    // On remet le curseur dedans
    } 
    // Si le serveur est en panne (500)
    else if (err.status === 500) {
        errorEl.textContent = "Serveur indisponible, réessayez plus tard.";
    }
    // Sinon, on affiche le message technique envoyé par le backend
    else {
        errorEl.textContent = err.message;
    }
  }
});
