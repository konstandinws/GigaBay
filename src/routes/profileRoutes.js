import express from "express";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/me", authMiddleware, profileController.getProfile());

export default router;