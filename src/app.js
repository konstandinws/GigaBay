import express from "express"
import auctionRoutes from "./routes/auctionRoutes.js"

const app = express();

app.use(express.json());


app.get("/", (req, res) => {
    res.send("test");
});

app.use("/api/acutions", auctionRoutes);



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
})