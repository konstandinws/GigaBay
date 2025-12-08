import AuthService from "./services/auth.service.js"; 

export function updateHeader() {
    const headerActions = document.querySelector(".header-actions");
    if (!headerActions) return; 

    // On nettoie tout le contenu actuel
    headerActions.innerHTML = "";

    const user = AuthService.getCurrentUser();

    // --- 1. BOUTON LANGUE (Commun) ---
    // On le recrée ou on le garde, ici je le recrée pour l'ordre
    const langDiv = document.createElement("div");
    langDiv.className = "lang";
    langDiv.innerHTML = "🇫🇷 <span>French</span>"; // Safe car statique

    // --- SCÉNARIO : CONNECTÉ ✅ ---
    if (user) {
        const displayName = user.username || "Mon Profil";

        // Bouton Profil
        const profileBtn = document.createElement("a");
        profileBtn.href = "/profile";
        profileBtn.className = "btn-connexion";
        profileBtn.style.backgroundColor = "#447c00";
        // SAFE : textContent empêche l'interprétation HTML du pseudo
        profileBtn.textContent = `👤 ${displayName}`;

        // Bouton Déconnexion
        const logoutBtn = document.createElement("button");
        logoutBtn.className = "btn-inscription";
        logoutBtn.style.cursor = "pointer";
        logoutBtn.textContent = "🚪 Déconnexion";
        logoutBtn.addEventListener("click", () => {
            AuthService.logout(); 
        });

        // On ajoute les éléments dans l'ordre
        headerActions.append(profileBtn, logoutBtn, langDiv);
    } 
    
    // --- SCÉNARIO : PAS CONNECTÉ ❌ ---
    else {
        // Bouton Connexion
        const loginBtn = document.createElement("a");
        loginBtn.href = "/login";
        loginBtn.className = "btn-connexion";
        loginBtn.textContent = "👤 Connexion";

        // Bouton Inscription
        const registerBtn = document.createElement("a");
        registerBtn.href = "/register";
        registerBtn.className = "btn-inscription";
        registerBtn.textContent = "🧾 Inscription";

        headerActions.append(loginBtn, registerBtn, langDiv);
    }
}