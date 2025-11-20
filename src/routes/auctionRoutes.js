import express from "express";
import auctionController from "../controllers/auctionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auctionController.getAll);
router.get("/:id", auctionController.getOne);

//exemple de test CURL
// curl -X POST http://localhost:3000/api/auctions 
// -H "Content-Type: application/json" 
// -d "{\"title\": \"Test Windows\", \"price\": 150, \"end\": \"2025-05-20\"}"
router.post("/", authMiddleware, auctionController.addOne);

//curl -X PUT http://localhost:3000/api/auctions/1 
// -H "Content-Type: application/json" 
// -d "{\"price\": 75}"
router.put("/:id", auctionController.modify);

export default router;