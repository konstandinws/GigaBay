import AuthService from "../Services/authService.js";

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
            accessToken: result.accessToken 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
};

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


export default { login, register, refreshAccessToken, logout};