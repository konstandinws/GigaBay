import AuthService from "./services/auth.service.js";

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
    await AuthService.login(email, password);

    const auctionId = getAuctionIdFromUrl();
    if (auctionId) {
      window.location.href =
        "index.html?auctionId=" + encodeURIComponent(auctionId);
    } else {
      window.location.href = "index.html";
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
