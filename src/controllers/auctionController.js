import AuctionService from "../Services/auctionService.js"

// gere les requetes http
// je ne fais en classes mais comme dans le cours du prof

const getAll = async (req, res) => {
    try {
        // On récupère page et limit de l'URL, avec des valeurs par défaut
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

        const allAuctions = await AuctionService.getAllAuctions(page, limit);
        
        res.status(200).json({ 
            status: "success",
            page: page,
            data: allAuctions 
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}

const getOne = async (req, res) => {
    try{
        const id = req.params.id;
        // grace aux methodes statiques pas besoin de creer 
        // un objet AuctionService pour appeler les methodes
        const auction = await AuctionService.getAuctionById(id);
        res.status(200).json(auction);
    } catch (error){
        res.status(404).json({message: error.message});
    }
}

const addOne = async (req, res) => {
    try{

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Utilisateur non identifié" });
        }

        const userId = req.user.id; // Vient du Token qui a été injecté par authMiddleware
        const auctionData = req.body; // Vient du formulaire

        const newAuction = await AuctionService.createAuction(auctionData, userId);

        res.status(201).json({
            status: "success",
            data: newAuction
        })
    }
    catch (error) {
        res.status(400).json({message: error.message});
    }
}

// pour l'instant pas implementé avec sqlite
const modify = (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        const modifiedAuction = AuctionService.modifyAuction(id, data);

        res.status(200).json({
            status: "success",
            data: modifiedAuction
        });
    } catch (error){
        if (error.message.includes("introuvable")) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Erreur serveur", error: error.message });
        }
    }
}

const addImages = async (req, res) => {
    try {
        if (!req.files) return res.status(400).json({ error: "Aucun fichier" });
        
        // On appelle le service
        const images = await AuctionService.addMultipleImages(req.params.id, req.user.id, req.files);
        
        res.status(201).json({ status: "success", data: images });
    } catch (e) {
        const status = e.message.includes("interdit") ? 403 : 400;
        res.status(status).json({ error: e.message });
    }
};

export default {getAll, getOne, addOne, modify, addImages};