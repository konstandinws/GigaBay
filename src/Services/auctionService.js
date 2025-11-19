import Auction from "../models/Auction";

class AuctionService {
    
    getAllAuctions(){
        const auctions = Auction.getAllAuctions();
        return auctions;
    }

    getAuctionById(id) {
        const auction = Auction.findById(id);

        if (!auction) {
            throw new Error('Enchère introuvable');
        }
        return auction;
    }
}