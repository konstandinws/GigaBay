import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import User from "../models/User.js";
import db from "../config/db.js";

const runSql = (query) => {
    return new Promise((resolve, reject) => {
        db.run(query, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

class BidService {
  static async placeBid(userId, auctionId, amount) {
    
    // DEBUT DE LA TRANSACTION 
    await runSql("BEGIN IMMEDIATE TRANSACTION");

    try {
        //On récupère les données à l'intérieur de la transaction
        const auction = await Auction.findById(auctionId);
        
        if (!auction) throw new Error("Enchère introuvable.");

        // Vérif date
        if (new Date(auction.end_date) < new Date()) {
             throw new Error("Cette enchère est terminée.");
        }

        // Vérif propriétaire
        if (auction.user_id === userId) {
            throw new Error("Vous ne pouvez pas enchérir sur votre propre objet.");
        }

        // Vérif montant 
        const currentPrice = Number(auction.current_price);
        const numericAmount = Number(amount);

        if (numericAmount <= currentPrice) {
            throw new Error(`Le montant doit être supérieur au prix actuel (${currentPrice} €).`);
        }

        // LOGIQUE DE REMBOURSEMENT 
        const lastBid = await Bid.findHighest(auctionId);
        
        if (lastBid) {
            // On rembourse l'ancien enchérisseur
            await User.updateBalance(lastBid.user_id, lastBid.amount);
        }

        // LOGIQUE DE DÉBIT 
        // On recharge le user pour avoir son solde à jour (après un potentiel remboursement s'il s'est surenchéri lui-même)
        const user = await User.findById(userId);
        
        if (user.balance < numericAmount) {
            throw new Error(`Fonds insuffisants. Votre solde est de ${user.balance} €.`);
        }

        // On retire l'argent
        await User.updateBalance(userId, -numericAmount);

        // CRÉATION DE L'ENCHÈRE
        const bid = await Bid.create({
            amount: numericAmount,
            user_id: userId,
            auction_id: auctionId,
        });

        // MISE À JOUR DU PRIX DE L'ENCHÈRE
        await Auction.updateCurrentPrice(auctionId, numericAmount);

        // VALIDATION FINALE 
        await runSql("COMMIT");

        return {
            bid,
            newPrice: numericAmount,
        };

    } catch (error) {
        // EN CAS DE PROBLÈME ANNULATION 
        await runSql("ROLLBACK");
        
        // On relance l'erreur pour que le contrôleur puisse l'afficher à l'utilisateur
        throw error;
    }
  }
}

export default BidService;
