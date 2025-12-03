// separer la logique de creation et de gestion des token pour pas
// rendre authService trop lourd
import jwt from "jsonwebtoken";
import crypto from "crypto";

const accessSecret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

if (!accessSecret || !refreshSecret) {
    throw new Error("ERREUR FATALE : La variable JWT_SECRET n'est pas définie dans le fichier .env !");
}

class TokenService {
    
    static generateToken(user){

        const accessToken = jwt.sign(
            { 
                id: user.id,
                name: user.name,
                type: "access" 
            },
            accessSecret,
            { expiresIn : "15m" }
        );

        const refreshToken = jwt.sign(
            { 
                id: user.id,
                name: user.name,
                type: "refresh",
                jti: crypto.randomBytes(16).toString('hex')
            },
            refreshSecret,
            { expiresIn : "7d" }
        );

        const decodedRefresh = jwt.decode(refreshToken);

        return {accessToken, refreshToken, jti: decodedRefresh.jti, exp: decodedRefresh.exp};
    }

    static generateNewAccessToken(user){
        
        const accessToken = jwt.sign(
            { 
                id: user.id,
                name: user.name,
                type: "access" 
            },
            accessSecret,
            { expiresIn : "15m" }
        );

        return accessToken;
    }

    static verifyRefreshToken(token) {
            return jwt.verify(token, refreshSecret);
    }

    static decodeRefreshToken(token) {
            return jwt.decode(token);
    }
}

export default TokenService;