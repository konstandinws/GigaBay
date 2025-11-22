import express from "express";
import authController from "../controllers/authController.js"; // On importe le contrôleur que tu as créé juste avant

const router = express.Router();

// Quand on reçoit un POST sur /login, on appelle le contrôleur
router.post("/login", authController.login);

router.post("/register", authController.register);

// ajouter un validation middleware

export default router;