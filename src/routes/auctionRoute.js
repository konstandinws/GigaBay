import express from "express";
import { createAuction, listAuctions } from "../controllers/auctionController.js";

const router = express.Router();

router.post("/", createAuction);
router.get("/", listAuctions);

export default router;