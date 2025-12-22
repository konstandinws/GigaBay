import express from "express";
import auctionController from "../controllers/auctionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import bidController from "../controllers/bidController.js"
import { upload } from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import { createAuctionSchema } from "../validators/auctionSchemas.js";

const router = express.Router();

//liste toutes les enchères
router.get("/", auctionController.getAll);

router.get("/mine", authMiddleware, auctionController.getMine);

//enchère par id
router.get("/:id", auctionController.getOne);

// créer une enchère
router.post("/", validate(createAuctionSchema), authMiddleware, auctionController.addOne);

router.put("/:id", authMiddleware, auctionController.modify);

// route pour les images, upmoad de plusieurs images
router.post("/:id/images", 
    authMiddleware, 
    upload.array("images", 5), 
    auctionController.addImages
);

//nouvelle route pour ENCHÉRIR sur une enchère
router.post(
  "/:id/bids",
  authMiddleware,
  bidController.placeBid
);
export default router;