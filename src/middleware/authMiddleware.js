import jwt from "jsonwebtoken";

const SECRET_KEY = "MON_SECRET_TRES_SECRET"; // Doit être la même que dans le service

const authMiddleware = (req, res, next) => {
    // 1. Récupérer le token dans le header (Authorization: Bearer <token>)
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ message: "Accès refusé. Token manquant." });
    }

    const token = authHeader.split(" ")[1]; // On enlève le mot "Bearer"

    try {
        // 2. Vérifier le token
        const decoded = jwt.verify(token, SECRET_KEY);
        
        // 3. On "colle" l'utilisateur dans la requête pour que le controlleur sache qui c'est
        req.user = decoded;
        
        // 4. On laisse passer
        next(); 
    } catch (error) {
        res.status(401).json({ message: "Token invalide." });
    }
};

export default authMiddleware;