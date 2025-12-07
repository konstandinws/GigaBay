import { apiFetch, API_BASE_URL } from "../api/client.js";

class AuctionService {
    static async getAll() {
        return await apiFetch("/auctions");
    }

    static async create(auctionData) {
        return await apiFetch("/auctions", {
            method: "POST",
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
        return await response.json();
    }
}

export default AuctionService;
