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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || "Une erreur inconnue est survenue");
        error.status = response.status; // On colle le code (ex: 401)
        error.code = data.code;         // code d'erreur du backend
        throw error;
    }

    return data;
}