import { apiFetch } from "../api/client.js";
import { parseJwt } from "../utils/jwtParser.js";

class AuthService {
    static async login(email, password) {
        const data = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        if (data.token) {
            localStorage.setItem("token", data.token);
            // On ne stocke plus l'user, juste le token suffit !
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
        // Plus besoin de remove "user" car on ne l'utilise plus
        window.location.href = "/login";
    }

    static getCurrentUser() {
        const token = localStorage.getItem("token");
        if (!token) window.location.href = "/login";

        const decoded = parseJwt(token); 

        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            this.logout();
            return null;
        }

        return decoded;
    }
}

export default AuthService;