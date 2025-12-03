// separer la logique de creation et de gestion des token pour pas
// rendre authService trop lourd

import jwt from "jsonwebtoken";
import crypto from "node:crypto";


const accessSecret = toString(process.env.JWT_SECRET);
const refreshSecret = toString(process.env.JWT_REFRESH_TOKEN_SECRET);

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

        return {accessToken, refreshToken};
    }

    static async refreshAccessToken(){
        try{
            const decoded = jwt.verify(refreshToken, refreshSecret);

            if (decoded.type !== "refresh"){
                throw new Error("type de token invalide");
            }

            const tokenRecord = await RefreshToken.findOne({
                userId: decoded.id,
                tokenId: decoded.jti 
            });

            if(!tokenRecord || tokenRecord.revoked){
                throw new Error("Refresh token révoqué");
            }

            const user = await User.findById(decoded.id);
            if(!user){
                throw new Error("Utilisateur introuvable");
            }

            const newAccesToken = jwt.sign(
                {
                    id:user.id,
                    name: user.name,
                    type: "access"
                },
                accessSecret,
                { expiresIn: "15m"}
            );

            // IMPORTANT POUR LA ROTATION
            // generer un nouvel refresh token et le retourner !!!

            return {accessToken: newAccesToken};

        }  
        catch(error){
            throw new Error("refresh token invalide")
        } 
    }

    static async revokeTokens(userId, tokenId = null){
        if(tokenId){
            await RefreshToken.updateOne(
                { userId, tokenId },
                { revoked: true, revokedAt: new Date() }
            );
        } else {
            await RefreshToken.updateMany(
                { userId },
                { revoked: true, revokedAt: new Date()}
            );
        }
    }
}

export default TokenService;