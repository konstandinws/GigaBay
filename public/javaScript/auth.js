import AuthService from "./services/auth.service.js"; 

// Fonction principale
export function updateHeader() {
    // 1. On cible la zone où sont les boutons
    const headerActions = document.querySelector(".header-actions");
    if (!headerActions) return; // Sécurité si la div n'existe pas

    // 2. On récupère l'utilisateur en mémoire
    const user = AuthService.getCurrentUser();

    // 3. SCÉNARIO : CONNECTÉ ✅
    if (user) {
        // On remplace le HTML par le bouton Profil et Déconnexion
        // J'utilise user.username, ou user.email si username n'existe pas
        const displayName = user.username || "Mon Profil";

        headerActions.innerHTML = `
            <a href="/profile" class="btn-connexion" style="background-color: #447c00;">
                👤 ${displayName}
            </a>
            <button id="logout-btn" class="btn-inscription" style="cursor: pointer;">
                🚪 Déconnexion
            </button>
            <div class="lang">
                🇫🇷 <span>French</span>
            </div>
        `;

        // On active le bouton déconnexion qu'on vient de créer
        document.getElementById("logout-btn").addEventListener("click", () => {
            AuthService.logout(); 
        });
    } 
    
    // 4. SCÉNARIO : PAS CONNECTÉ ❌
    else {
        // On remet les boutons par défaut
        headerActions.innerHTML = `
            <a href="/login" class="btn-connexion">👤 Connexion</a>
            <a href="/register" class="btn-inscription">🧾 Inscription</a>
            <div class="lang">
                🇫🇷 <span>French</span>
            </div>
        `;
    }
}
