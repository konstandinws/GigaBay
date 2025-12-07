import { apiFetch } from "../api/client.js";

class AuthService {
    static async login(email, password) {
        const data = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        // Si succès, on sauvegarde tout de suite
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
        }
        return data.user;
    }

    static async register(username, email, password) {
        return await apiFetch("/auth/register", {
            method: "POST",
            body: JSON.stringify({ username, email, password })
        });
    }

    static logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    }

    static getCurrentUser() {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    }
}

export default AuthService;