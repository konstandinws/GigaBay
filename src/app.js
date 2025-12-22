import dotenv from "dotenv/config";
import express from "express"
import auctionRoutes from "./routes/auctionRoutes.js"
import authRoutes from "./routes/authRoutes.js";
import authViewsRoutes from "./routes/auth.views.js";
import cors from "cors";  //autorise le frontend pour plus tard
import profileRoutes from "./routes/profileRoutes.js"
import "./config/db.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fileMiddleware from "./middleware/fileMiddleware.js";

import http from "http"; 
import { Server } from "socket.io";

import auctionSocket from "./sockets/auctionSocket.js";

const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app); 

const allowedOrigins = [
    `http://localhost:${PORT}`,
]

const corsOptions = {
    origin: allowedOrigins, // Autorise le frontend
    credentials: true, // Autorise les cookies (Refresh Token)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}

const io = new Server(server, {
    cors: {
        origin: allowedOrigins, // On reprend la même liste
        methods: ["GET", "POST"],
        credentials: true // Important pour les cookies de session socket si besoin
    }
});

auctionSocket(io);
app.use((req, res, next) => {
    req.io = io; // On rend le socket accessible partout dans l'API
    next();
});
// Middlewares globaux
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Fichiers statiques (html, css, js, images, etc.)
app.use(express.static(path.join(__dirname, "..", "public")));


app.use("/", authViewsRoutes);

// Use routes
app.use("/api/auctions", auctionRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes)

app.get("/uploads/:filename", fileMiddleware);

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

