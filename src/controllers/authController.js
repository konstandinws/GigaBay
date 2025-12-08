import AuthService from "../Services/authService.js";
import User from "../models/User.js";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    res.json({
      status: "success",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const register = async (req, res) => {
  try {
    // On récupère user ET token du service
    const { user, token } = await AuthService.register(req.body);

    res.status(201).json({
      status: "success",
      message: "Compte créé avec succès",
      user: user,
      token: token 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
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
};

export default { login, register, me, addFunds };