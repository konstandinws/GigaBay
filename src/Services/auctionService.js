import Auction from "../models/Auction.js";

// le service gere la logique en appellant le modele
//il ne s'occupe pas des requetes http

// mehtodes statiques pour eviter de creer un objet 
class AuctionService {
    
    static async getAllAuctions(page = 1, limit = 12){
        // Page 1 : offset 0, Page 2 : offset 12
        const offset = (page - 1) * limit;
        const auctions = await Auction.getAll(limit, offset);
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
        // 1. Vérification existance
        const auction = await Auction.findById(id);
        if (!auction) {
            throw new Error("Enchère introuvable.");
        }

        // 2. Vérification propriétaire
        if (auction.user_id !== userId) {
            throw new Error("Accès interdit : Vous n'êtes pas le vendeur de cet objet.");
        }

        // 3. Préparation des données
        const updateData = {
            title: data.title || auction.title,
            description: data.description || auction.description
        };

        // 4. Appel au modèle
        await Auction.update(id, updateData);
        
        return { id, ...updateData };
    }

    static async getAuctionsByUser(userId) {
        return await Auction.findByUserId(userId);
    }

    static async addMultipleImages(auctionId, userId, files) {
        const auction = await Auction.findById(auctionId);
        if (!auction) throw new Error("Enchère introuvable");

        if (auction.user_id !== userId) {
            throw new Error("Accès interdit : Vous n'êtes pas le vendeur.");
        }

        const uploadedImages = [];

        //On boucle sur chaque fichier reçu
        for (const file of files) {
            // On l'ajoute dans la table 'images'
            const saved = await Auction.addImage(auctionId, file.filename);
            uploadedImages.push(saved);
        }

        //On met à jour l'image principale de l'enchère avec la PREMIÈRE image
        if (files.length > 0) {
            const mainImageUrl = `/uploads/${files[0].filename}`;
            await Auction.updateImage(auctionId, mainImageUrl);
        }

        return uploadedImages;
    }
}

export default AuctionService;