import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import profileController from "../controllers/profileController.js";

const router = express.Router();

router.get("/me", authMiddleware, profileController.getProfile);

export default router;