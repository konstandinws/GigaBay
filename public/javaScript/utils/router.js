import AuthService from "../services/auth.service.js";

// Il faut être connecté
const PROTECTED_ROUTES = [
    "/profile",
    // "/settings", etc.
];

// Il faut être déconnecté
const GUEST_ONLY_ROUTES = [
    "/login", 
    "/register",
];

// Fonction principale de sécurité
function checkAccess() {
    const path = window.location.pathname; // ex: "/new-auction"
    const user = AuthService.getCurrentUser();

    // Tentative d'accès à une page privée sans être connecté
    if (PROTECTED_ROUTES.some(route => path.includes(route)) && !user) {
        // Redirection vers login avec retour automatique
        window.location.replace(`/login?redirect=${encodeURIComponent(path)}`);
        return; 
    }

    // CAS 2 : Tentative d'accès à Login/Register alors qu'on est déjà connecté
    if (GUEST_ONLY_ROUTES.some(route => path.includes(route)) && user) {
        window.location.replace("/"); // Retour accueil
        return;
    }
};

checkAccess();

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        checkAccess();
    }
    checkAccess();
});