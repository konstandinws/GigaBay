// on verifie le mdp et cree le token

import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = "MON_SECRET_TRES_SECRET"; // À mettre dans .env normalement

class AuthService {
    static async login(email, password) {
        // Vérifier si l'utilisateur existe

        // console.log("1. Email reçu:", email);
        // console.log("2. Mot de passe reçu:", password);
        const user = await User.findByEmail(email);
        if (!user) {
            throw new Error("Email ou mot de passe incorrect");
        }

        // Vérifier le mot de passe 
        // console.log("3. User trouvé:", user);
        // console.log("4. Password en BDD:", user.password);
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error("Email ou mot de passe incorrect");
        }
        

        // Générer le Token 
        const token = jwt.sign(
            { id: user.id, name: user.name }, // Ce qu'on met dans le badge
            SECRET_KEY,                       // La clé pour signer
            { expiresIn: '1h' }               // Durée de validité
        );

        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    static async register(userData) {
        // Vérifier si l'email est déjà pris
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser) {
            throw new Error("Cet email est déjà utilisé.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const newUser = await User.create(
            userData.username, 
            userData.email, 
            hashedPassword 
        );

        return newUser;
    }
}

export default AuthService;