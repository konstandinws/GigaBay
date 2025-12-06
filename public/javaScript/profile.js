const API_BASE_URL = "http://localhost:3000";

export async function loadProfile() {
    const token = localStorage.getItem("token");
    if(!token) {
        window.location.href = "login.html";
        return;
    }

    
    const res = await fetch(API_BASE_URL + "/api/auth/me", {
            headers: {Authorization: `Bearer ${token}`},
    });


    const data = await res.json();
    if(!res.ok) {
        alert("Erreur : " + data.message);
        return;
    }

    document.getElementById("profile-email").textContent = data.user.email;
    document.getElementById("profile-id").textContent = data.user.id;
}

document.getElementById("logout-button").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});
