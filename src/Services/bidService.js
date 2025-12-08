import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import User from "../models/User.js";

class BidService {
  static async placeBid(userId, auctionId, amount) {
    // Vérifie que l’enchère existe
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      throw new Error("Enchère introuvable.");
    }

    // Empêche l’utilisateur d’enchérir sur sa propre enchère
    if (auction.user_id === userId) {
      throw new Error("Vous ne pouvez pas enchérir sur votre propre enchère.");
    }

    // Vérifier que l’enchère n’est pas terminée
    const now = new Date();
    const endDate = new Date(auction.end_date);
    if (!isNaN(endDate.getTime()) && endDate < now) {
      throw new Error("Cette enchère est déjà terminée.");
    }

    // Vérifier le montant (doit être strictement supérieur au prix actuel)
    const currentPrice = Number(auction.current_price);
    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= currentPrice) {
      throw new Error(
        `Le montant doit être supérieur au prix actuel (${currentPrice} €).`
      );
    }

    const user = await User.findById(userId);
    if (user.balance < numericAmount) {
        throw new Error(`Fonds insuffisants. Votre solde est de ${user.balance} €.`);
    }

    await User.updateBalance(userId, -numericAmount);

    const bid = await Bid.create({
      amount: numericAmount,
      user_id: userId,
      auction_id: auctionId,
    });

    // Mettre à jour le prix courant dans la table auctions
    await Auction.updateCurrentPrice(auctionId, numericAmount);

    return {
      bid,
      newPrice: numericAmount,
    };
  }
}

export default BidService;
