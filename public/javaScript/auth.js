const API_BASE_URL = "http://localhost:3000";

export async function getCurrentUser() {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }

    try {

        const res = await fetch(API_BASE_URL + "/api/auth/me", {
            headers: {Authorization: `Bearer ${token}`},    
        });

        if (!res.ok) { return null; }

        const data =  await res.json();
        return data.user;


    } catch (e) { return null; } 
}

export async function updateHeader() {
    const header = document.querySelector(".header-actions");
    if (!header) return;

    const user = await getCurrentUser();

    if (!user) {

        header.innerHTML = `
            <a href="login.html" class="btn-connexion">👤 Connexion</a>
            <a href="register.html" class="btn-inscription">🧾 Inscription</a>
            <div class="lang">🇫🇷 <span>French</span></div>
        `;
        return;
    }

    header.innerHTML = `
        <a href="profile.html" class="btn-connexion">👤 ${user.email}</a>
        <button id="logout-btn" class="btn-inscription">🚪 Déconnexion</button>
        <div class="lang">🇫🇷 <span>French</span></div>
    `;

    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
}

document.addEventListener("DOMContentLoaded", updateHeader);