import User from "../models/User.js";
import bcrypt from "bcrypt";
import TokenService from "../Services/tokenService.js";
import Token from "../models/Token.js";

function incorrectInput(){
    throw new Error("Email ou mot de passe incorrect");
}

class AuthService {
    static async login(email, password) {
        // Vérifier si l'utilisateur existe

        // console.log("1. Email reçu:", email);
        // console.log("2. Mot de passe reçu:", password);
        const user = await User.findByEmail(email);
        if (!user) {
            incorrectInput();
        }

        // Vérifier le mot de passe 
        // console.log("3. User trouvé:", user);
        // console.log("4. Password en BDD:", user.password);
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            incorrectInput();
        }

        const { accessToken, refreshToken, jti, exp } = TokenService.generateToken(user);

        //stocker le refresh token dans la DB
        await Token.create({ jti: jti, userId: user.id, exp: exp });

        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, accessToken, refreshToken };
    }

    static async register(userData) {
        // Vérifier si l'email est déjà pris
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser) {
            throw new Error("Cet email est déjà utilisé.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // enlever le mdp et retourner les access et refresh token
        const newUser = await User.create(
            userData.username, 
            userData.email, 
            hashedPassword 
        );

        return newUser;
    }
}

export default AuthService;