import { getCurrentUser } from "../javaScript/auth.js";

 async function loadProfile() {
    const user = await getCurrentUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("profile-email").textContent = data.user.email;
    document.getElementById("profile-id").textContent = data.user.id;

}

document.getElementById("logout-button").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

loadProfile();