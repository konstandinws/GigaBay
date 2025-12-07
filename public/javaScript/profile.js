import { getCurrentUser } from "../javaScript/auth.js";

 async function loadProfile() {
    const user = await getCurrentUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("profile-email").textContent = user.email;
    document.getElementById("profile-id").textContent = user.id;

}

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

loadProfile();