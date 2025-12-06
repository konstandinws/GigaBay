import dotenv from "dotenv/config";
import express from "express"
import auctionRoutes from "./routes/auctionRoutes.js"
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js"
import cors from "cors";
import "./config/db.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
    res.send("API OK");
});

// Use routes
app.use("/api/auctions", auctionRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));





const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// app.use(express.static("public"));
// A utiliser plus tard pour servir des fichiers statiques (images, css, js, etc.):
// &
// res.SendFile(path.join(__dirname, 'public', 'index.html'));
// Pour servir un fichier HTML statique en réponse à une requête.