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