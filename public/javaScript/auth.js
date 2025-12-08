import AuthService from "./services/auth.service.js"; 

export function updateHeader() {
    const headerActions = document.querySelector(".header-actions");
    if (!headerActions) return; 

    // On nettoie tout le contenu actuel
    headerActions.innerHTML = "";

    const user = AuthService.getCurrentUser();

    const langDiv = document.createElement("div");
    langDiv.className = "lang";
    langDiv.innerHTML = "🇫🇷 <span>French</span>";

    if (user) {
        const displayName = user.username || "Mon Profil";

        const profileBtn = document.createElement("a");
        profileBtn.href = "/profile";
        profileBtn.className = "btn-connexion";
        profileBtn.style.backgroundColor = "#447c00";

        profileBtn.textContent = `👤 ${displayName}`;

        const logoutBtn = document.createElement("button");
        logoutBtn.className = "btn-inscription";
        logoutBtn.style.cursor = "pointer";
        logoutBtn.textContent = "🚪 Déconnexion";
        logoutBtn.addEventListener("click", () => {
            AuthService.logout(); 
        });


        headerActions.append(profileBtn, logoutBtn, langDiv);
    } 
    
    else {

        const loginBtn = document.createElement("a");
        loginBtn.href = "/login";
        loginBtn.className = "btn-connexion";
        loginBtn.textContent = "👤 Connexion";


        const registerBtn = document.createElement("a");
        registerBtn.href = "/register";
        registerBtn.className = "btn-inscription";
        registerBtn.textContent = "🧾 Inscription";

        headerActions.append(loginBtn, registerBtn, langDiv);
    }
}