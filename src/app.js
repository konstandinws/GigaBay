import express from "express"
import auctionRoutes from "./routes/auctionRoutes.js"

// le programme se lance a groupe01/src/app.js d'ou les ./ ou ../

const app = express();

app.use(express.json());


app.get("/", (req, res) => {
    res.send("test");
});


app.use("/api/auctions", auctionRoutes);



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
})