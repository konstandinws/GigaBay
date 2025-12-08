import AuthService from "../services/auth.service.js";


export function requireAuth(redirectUrl = "/login") {
    const user = AuthService.getCurrentUser();
    
    if (!user) {
        // On dit au login : "Une fois connecté, renvoie-le ici !"
        const currentPath = window.location.pathname;
        window.location.href = `${redirectUrl}?redirect=${encodeURIComponent(currentPath)}`;
        return null;
    }

    return user;
}