import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import User from "../models/User.js";

class BidService {
  static async placeBid(userId, auctionId, amount) {
    const auction = await Auction.findById(auctionId);
    if (!auction) throw new Error("Enchère introuvable.");

    // Vérifications de base (terminé, montant...)
    const now = new Date();
    if (new Date(auction.end_date) < now) throw new Error("Cette enchère est terminée.");

    const currentPrice = Number(auction.current_price);
    const numericAmount = Number(amount);

    if (numericAmount <= currentPrice) {
      throw new Error(`Le montant doit être supérieur à ${currentPrice} €.`);
    }

    // On cherche s'il y a déjà une enchère dessus
    const lastBid = await Bid.findHighest(auctionId);

    //Si oui, on REMBOURSE l'ancien enchérisseur (que ce soit moi ou un autre)
    if (lastBid) {
        await User.updateBalance(lastBid.user_id, lastBid.amount);
    }

    // Maintenant on vérifie si l'utilisateur a assez d'argent pour la NOUVELLE offre
    const user = await User.findById(userId);
    
    if (user.balance < numericAmount) {

        throw new Error(`Fonds insuffisants. Solde : ${user.balance} €.`);
    }

    // On débite le nouveau montant
    await User.updateBalance(userId, -numericAmount);

    // On crée la nouvelle enchère
    const bid = await Bid.create({
      amount: numericAmount,
      user_id: userId,
      auction_id: auctionId,
    });

    await Auction.updateCurrentPrice(auctionId, numericAmount);

    return { bid, newPrice: numericAmount };
  }
}

export default BidService;
