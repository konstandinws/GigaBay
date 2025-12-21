export const API_BASE_URL = "http://localhost:3000/api";

// Une fonction unique pour gérer tous les appels
export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    
    // On prépare les headers par défaut
    const headers = {
        "Content-Type": "application/json",
        ...options.headers // On ajoute les headers spécifiques si besoin
    };

    // Si on a un token, on l'ajoute automatiquement
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (response.status === 401 && !options._retry) {
        // On marque la requête pour ne pas boucler à l'infini
        options._retry = true; 

        try {
            // 1. On tente de rafraichir le token
            // Note: Le cookie "jwt" (refresh token) est envoyé automatiquement par le navigateur
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                
                // 2. On sauvegarde le nouveau token
                localStorage.setItem("token", refreshData.accessToken);
                
                // 3. On met à jour le header de la requête originale
                config.headers["Authorization"] = `Bearer ${refreshData.accessToken}`;

                // 4. On RÉESSAIE la requête initiale
                response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            } else {
                // Si le refresh a échoué (ex: refresh token expiré aussi), on déconnecte
                throw new Error("Session expirée");
            }
        } catch (error) {
            // Nettoyage final si tout a échoué
            localStorage.removeItem("token");
            window.location.href = "/login";
            throw error;
        }
    }

    if (!response.ok) {
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = {}; // Si pas de JSON, objet vide
        }

        const error = new Error(data.message || "Une erreur inconnue est survenue");
        error.status = response.status; // On colle le code (ex: 401)
        error.code = data.code;         // code d'erreur du backend
        throw error;
    }

    return await response.json();
}