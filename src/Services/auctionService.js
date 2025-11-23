import Auction from "../models/Auction.js";

// le service gere la logique en appellant le modele
//il ne s'occupe pas des requetes http

// mehtodes statiques pour eviter de creer un objet 
class AuctionService {
    
    static async getAllAuctions(){
        const auctions = await Auction.getAll();
        return auctions;
    }

    static async getAuctionById(id) {
        const auction = await Auction.findById(id);

        if (!auction) {
            throw new Error('Enchère introuvable');
        }
        return auction;
    }

    static async createAuction(inputData, userId) {
        if (!inputData.title || !inputData.price) {
            throw new Error("Le titre et le prix sont obligatoires");
        }

        if (inputData.price < 0) {
            throw new Error("Le prix ne peut pas être négatif.");
        }
        //Préparation de l'objet pour le Modèle 
        //objet : { title, description, starting_price, end_date, user_id }
        const dataForDb = {
            title: inputData.title,
            description: inputData.description || "",
            starting_price: inputData.price, // On renomme price en starting_price
            end_date: inputData.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours par défaut
            user_id: userId
        };

        // Appel au modèle
        const createdAuction = await Auction.create(dataForDb);
        
        return createdAuction;
    }

    // fonction incomplete
    static async modifyAuction(id, data, userId) {
        // On cherche d'abord l'enchère pour voir si elle existe
        const auction = await Auction.findById(id);

        if (!auction) {
            throw new Error("Enchère introuvable.");
        }

        // On vérifie si l'utilisateur est le propriétaire
        if (auction.user_id !== userId) {
            throw new Error("Accès interdit : Vous n'êtes pas le vendeur de cet objet.");
        }

        // on appelle le modèle pour faire la modif
        // const updated = await Auction.update(); pas encore implementée dans le modele Auction.js
        
        // return updated;
    }
}

export default AuctionService;