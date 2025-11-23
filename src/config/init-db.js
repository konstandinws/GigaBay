import db from "../config/db.js";

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

    // TABLE pour les images
    db.run(`
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            auction_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
        )
    `);

    console.log("✅ Tables créées avec succès.");
});

db.close();
