import BidService from "../Services/bidService.js";

const placeBid = async (req, res) => {
  try {
    const userId = req.user?.id;       
    const auctionId = req.params.id;
    const { amount } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    if (!amount) {
      return res.status(400).json({ message: "Le montant est obligatoire." });
    }

    const result = await BidService.placeBid(userId, auctionId, amount);

    res.status(201).json({
      status: "success",
      message: "Enchère placée avec succès.",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export default { placeBid };
