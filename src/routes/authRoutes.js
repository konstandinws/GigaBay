import express from "express";
import authController from "../controllers/authController.js"; // On importe le contrôleur que tu as créé juste avant
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Quand on reçoit un POST sur /login, on appelle le contrôleur
router.post("/login", authController.login);

router.post("/register", authController.register);

router.get("/me", authMiddleware, authController.me);

router.post("/funds", authMiddleware, authController.addFunds);

router.post("/refresh", authController.refreshAccessToken);

router.post("/logout", authController.logout);

// ajouter un validation middleware

export default router;