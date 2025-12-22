import { apiFetch, API_BASE_URL } from "../api/client.js";

class AuctionService {
    
    static async getAll(page = 1, limit = 10, search = "") {
    let url = `/auctions?page=${page}&limit=${limit}`;
    if (search) {
        url += `&q=${encodeURIComponent(search)}`;
    }
    return await apiFetch(url);
    }

    static async getOne(id) {
        return await apiFetch(`/auctions/${id}`);
    }

    static async create(auctionData) {
        return await apiFetch("/auctions", {
            method: "POST",
            body: JSON.stringify(auctionData)
        });
    }

    static async update(id, auctionData) {
        return await apiFetch(`/auctions/${id}`, {
            method: "PUT",
            body: JSON.stringify(auctionData)
        });
    }

    static async placeBid(auctionId, amount) {
        return await apiFetch(`/auctions/${auctionId}/bids`, {
            method: "POST",
            body: JSON.stringify({ amount })
        });
    }
    
    static async uploadImages(auctionId, formData) {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/images`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) {
        try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch(e) { /* Si le serveur ne renvoie pas de JSON, on garde le message par défaut */ }
            
            throw new Error(errorMessage);
        }
        return await response.json();
    }

    static async getMine() {
        return await apiFetch("/auctions/mine");
    }
}

export default AuctionService;
