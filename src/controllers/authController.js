import AuthService from "../Services/authService.js";

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await AuthService.login(email, password);
        res.json({ status: "success", token: token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export default { login };