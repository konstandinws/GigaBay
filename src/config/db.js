import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

sqlite3.verbose();

// Permet de récupérer __dirname en modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Emplacement du fichier SQLite
const dbPath = path.join(__dirname, "../../database.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Erreur connexion SQLite:", err.message);
    } else {
        console.log("✅ Connecté à SQLite.");
    }
});

// Active les clés étrangères
db.run("PRAGMA foreign_keys = ON;", (err) => {
    if (err) {
        console.error("❌ Failed to enable foreign keys:", err.message);
    }
});

db.serialize(() => {
    console.log("🚧 Création des tables...");

    // TABLE users
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // TABLE auctions
    db.run(`
        CREATE TABLE IF NOT EXISTS auctions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            starting_price REAL NOT NULL,
            current_price REAL NOT NULL,
            end_date DATETIME NOT NULL,
            user_id INTEGER NOT NULL,

            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // TABLE bids
    db.run(`
        CREATE TABLE IF NOT EXISTS bids (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER NOT NULL,
            auction_id INTEGER NOT NULL,

            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
        )
    `);

    // TABLE tokens
    db.run(`
        CREATE TABLE IF NOT EXISTS tokens (
            jti TEXT PRIMARY KEY, 
            user_id INTEGER NOT NULL,
            expiration INTEGER NOT NULL, 
            revoked INTEGER DEFAULT 0,

            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `); 

    console.log("✅ Tables créées avec succès.");
});

export default db;
