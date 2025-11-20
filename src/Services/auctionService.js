import Auction from "../models/Auction.js";

// le service gere la logique en appellant le modele
//il ne s'occupe pas des requetes http

// mehtodes statiques pour eviter de creer un objet 
class AuctionService {
    
    static getAllAuctions(){
        const auctions = Auction.getAll();
        return auctions;
    }

    static getAuctionById(id) {
        const auction = Auction.findById(id);

        if (!auction) {
            throw new Error('Enchère introuvable');
        }
        return auction;
    }

    static createAuction(auctionData){
        if(!auctionData.title || !auctionData.price){
            throw new Error("Le titre et prix sont obligatoires");
        }
        if (auctionData.price < 0) {
            throw new Error("Le prix ne peut pas être négatif.");
        }

        const createdAuction = Auction.addAuction(auctionData);
        
        return createdAuction;
    }

    static modifyAuction(id, data){
        const modifiedAuction = Auction.modifyAuction(id, data);

        if(!modifiedAuction) {
            throw new Error("Enchère introuvable, impossible de modifier.");
        }

        return modifiedAuction;
    }
}

export default AuctionService;