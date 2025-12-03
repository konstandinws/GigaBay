import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET; // Doit être la même que dans le service

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
        req.user = decoded; // ici par exemple { id: 7, email: "test@test.com" }
        
        // 4. On laisse passer
        next(); 

    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        
        if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token invalide'
        });
        }
        
        if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Access Token expiré'
        });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

export default authMiddleware;