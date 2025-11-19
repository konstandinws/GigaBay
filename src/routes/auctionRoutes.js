import express from "express";
import auctionController from "../controllers/auctionController";

const router = express.Router();

router.get("/", auctionController.getAll);
router.get("/:id", auctionController.getOne);

export default router;