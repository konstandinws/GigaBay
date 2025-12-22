import AuthService from "../Services/authService.js";
import User from "../models/User.js";

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await AuthService.login(email, password);

        // Le Refresh Token va dans le COOKIE (Invisible pour le JS)
        res.cookie('jwt', token.refreshToken, { 
            httpOnly: true, 
            secure: false, 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        // L'Access Token va dans le BODY JSON (Accessible pour le JS)
        res.json({ 
            status: "success", 
            accessToken: token.accessToken,
            user: token.user 
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const register = async (req, res) => {
    try {
        const userData = req.body;
        const result = await AuthService.register(userData);
        
        res.cookie('jwt', result.refreshToken, { 
            httpOnly: true, 
            secure: false, 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(201).json({
            status: "success",
            message: "Compte créé avec succès !",
            user: result.newUser,
            accessToken: result.accessToken ,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
};

const me = async (req, res) => {
  try {
    const userId = req.user.id;

    const userFromDb = await User.findById(userId);

    if (!userFromDb) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const { password, ...userWithoutPassword } = userFromDb;

    res.status(200).json({
      status: "success",
      user: userWithoutPassword // On renvoie l'utilisateur frais avec le bon solde
    });
  } catch (error) {
    res.status(500).json({message: "Erreur serveur"});
  }
}

const addFunds = async (req, res) => {
    try {
        const userId = req.user.id;
        const amount = parseFloat(req.body.amount);

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Montant invalide." });
        }

        await User.updateBalance(userId, amount);
        
        // On renvoie le nouveau solde
        const user = await User.findById(userId);

        res.status(200).json({
            status: "success",
            message: "Fonds ajoutés !",
            newBalance: user.balance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const refreshAccessToken = async (req, res) => {
    try{
        const refreshToken = req.cookies?.jwt || req.body.refreshToken;
        const token = await AuthService.refreshToken(refreshToken);

        res.cookie('jwt', refreshToken, { 
            httpOnly: true, 
            secure: false, // true en HTTPS donc pour la production
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.json({status: "success", accessToken : token});
    } catch (error) {
        return res.status(403).json({ message: "Refresh impossible", error: error.message });
    }
}

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.jwt;
        
        // On invalide en base de données
        await AuthService.logout(refreshToken);

        // On supprime le cookie du navigateur
        res.clearCookie('jwt', { 
            httpOnly: true, 
            secure: false
        });

        res.json({ message: "Déconnexion réussie" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default { login, register, me, addFunds, refreshAccessToken, logout };

