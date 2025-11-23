import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

sqlite3.verbose();

// 1. CONFIGURATION DU CHEMIN
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../../database.sqlite");

// 2. CRÉATION DE LA CONNEXION
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Erreur connexion SQLite:", err.message);
    } else {
        console.log("✅ Connecté à SQLite.");
    }
});

// 3. INITIALISATION DES TABLES
db.serialize(() => {
    // Active les clés étrangères
    db.run("PRAGMA foreign_keys = ON;");

    console.log("🚧 Vérification des tables...");

    // Table USERS
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Table AUCTIONS (Avec image_url)
    db.run(`
        CREATE TABLE IF NOT EXISTS auctions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            starting_price REAL NOT NULL,
            current_price REAL NOT NULL,
            end_date DATETIME NOT NULL,
            user_id INTEGER NOT NULL,
            image_url TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Table BIDS
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

    // Table IMAGES
    db.run(`
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            auction_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
        )
    `);

    console.log("✅ Tables prêtes.");
    // ⛔️ J'AI SUPPRIMÉ db.close() ICI ! C'est ça qui cassait tout.
});

// 4. EXPORT DE LA CONNEXION (OUVERTE)
export default db;