import AuctionService from "../services/auctionService.js"

// gere les requetes http
// je ne fais en classes mais comme dans le cours du prof

const getAll = (req, res) => {
    try {
        const allAuctions = AuctionService.getAllAuctions();
        res.status(200).json({ data: allAuctions });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}

const getOne = (req, res) => {
    try{
        const id = req.params.id;
        // grace aux methodes statiques pas besoin de creer 
        // un objet AuctionService pour appeler les methodes
        const auction = AuctionService.getAuctionById(id);
        res.status(200).json(auction);
    } catch (error){
        res.status(404).json({message: error.message});
    }
}

const addOne = (req, res) => {
    try{
        const newAuction = AuctionService.createAuction(req.body);

        res.status(201).json({
            status: "success",
            data: newAuction
        })
    }
    catch (error) {
        res.status(400).json({message: error.message});
    }
}

export default {getAll, getOne, addOne};

