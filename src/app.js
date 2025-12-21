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

import http from "http"; 
import { Server } from "socket.io";

import auctionSocket from "./sockets/auctionSocket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
    cors: { origin: "*" } 
});

auctionSocket(io);

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Fichiers statiques (html, css, js, images, etc.)
app.use(express.static(path.join(__dirname, "..", "public")));


app.use("/", authViewsRoutes);

// Use routes
app.use("/api/auctions", auctionRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes)

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

