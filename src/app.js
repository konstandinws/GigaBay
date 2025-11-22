import express from "express"
import auctionRoutes from "./routes/auctionRoutes.js"
import authController from "./controllers/authController.js";
import authRoutes from "./routes/authRoutes.js";

// le programme se lance a groupe01/src/app.js d'ou les ./ ou ../

const app = express();

app.use(express.json());


app.get("/", (req, res) => {
    res.send("test");
});

//exemple de test CURL
// curl -X POST http://localhost:3000/api/auctions 
// -H "Content-Type: application/json" 
// -d "{\"title\": \"Test Windows\", \"price\": 150, \"end\": \"2025-05-20\"}"
app.use("/api/auctions", auctionRoutes);

app.use("/api/auth", authRoutes);



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
})