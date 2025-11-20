// on verifie le mdp et cree le token

import User from "../models/User.js";
//import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = "MON_SECRET_TRES_SECRET"; // À mettre dans .env normalement

class AuthService {
    static async login(email, password) {
        // 1. Vérifier si l'utilisateur existe
        const user = User.findByEmail(email);
        if (!user) {
            throw new Error("Email ou mot de passe incorrect");
        }

        // 2. Vérifier le mot de passe (Comparaison Hash vs Clair)
        // Pour le test ici, comme j'ai mis un faux hash plus haut, 
        // on va tricher un peu si tu n'as pas un vrai hash valide.
        // MAIS voici le vrai code à utiliser quand tu auras créé un user via inscription :
        /*
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error("Email ou mot de passe incorrect");
        }
        */
       
       // Pour ton test immédiat sans inscription, on simplifie :
       if (password !== "123456") {
           throw new Error("Mauvais mot de passe");
       }

        // 3. Générer le Token (Le badge d'accès)
        const token = jwt.sign(
            { id: user.id, name: user.name }, // Ce qu'on met dans le badge
            SECRET_KEY,                       // La clé pour signer
            { expiresIn: '1h' }               // Durée de validité
        );

        return token;
    }
}

export default AuthService;