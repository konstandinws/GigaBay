import AuthService from "../Services/authService.js";

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
    const newUser = await AuthService.register(req.body);

    res.status(201).json({
      status: "success",
      message: "Compte créé avec succès",
      user: newUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const me = async (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      user: req.user
    });
  } catch (error) {
    res.status(500).json({message: "erreur du serveur"});
  }
}

export default { login, register, me };