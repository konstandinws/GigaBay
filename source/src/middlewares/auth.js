import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
export async function isLogged(req, res, next) {
  try {
    // Récupérer le header Authorization
    const authHeader = req.header("Authorization"); // équiv. req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token manquant ou invalide",
      });
    }

    // Récupère uniquement le token (sans "Bearer ")
    const token = authHeader.substring(7); // enlève "Bearer "  

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Exemple attendu: { id, email, ... }

    // Mettre les infos du token sur la requête
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Erreur d'authentification :", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalide",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expiré",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
}

export default isLogged;