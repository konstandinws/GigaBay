import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt"; 
import fs from "fs"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "database.sqlite");
const logFilePath = path.join(__dirname, "users_credentials.txt");
const uploadsDir = path.join(__dirname, "uploads"); 

const db = new sqlite3.Database(dbPath);

// --- DONNÉES DE TEST ---
const firstNames = ["Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Henry", "Julie", "Thomas"];
const lastNames = ["Dupont", "Martin", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Michel", "Petit", "Roux"];
const adj = ["Ancien", "Superbe", "Rare", "Magnifique", "Puissant", "Vintage", "Cassé", "Neuf", "Légendaire", "Unique"];
const noun = ["Canapé", "Ordinateur", "Vélo", "Tableau", "Smartphone", "Montre", "Voiture", "Console", "Vase", "Instrument"];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const seedDatabase = async () => {
    console.log("🌱 Démarrage du remplissage...");

    // 1. Récupération des images disponibles
    let availableImages = [];
    if (fs.existsSync(uploadsDir)) {
        availableImages = fs.readdirSync(uploadsDir).filter(file => {
            return file.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        });
        console.log(`🖼️  ${availableImages.length} images trouvées dans /uploads`);
    }

    let fileContent = "=== LISTE DES UTILISATEURS DE TEST ===\n\n";
    const passwordClear = "password123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordClear, salt);

    db.serialize(() => {
        // --- ÉTAPE 0 : CRÉATION DES TABLES (Si elles n'existent pas) ---
        console.log("🔨 Création de la structure de la base...");
        
        db.run("PRAGMA foreign_keys = ON;");

        // Création Table Users
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                balance REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Création Table Auctions
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

        // Création Table Bids
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

        // Création Table Images
        db.run(`
            CREATE TABLE IF NOT EXISTS images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                auction_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
            )
        `);

        // --- ÉTAPE 1 : CRÉATION DES UTILISATEURS ---
        console.log("👤 Création des utilisateurs...");
        const stmtUsers = db.prepare(`INSERT INTO users (username, email, password, balance) VALUES (?, ?, ?, ?)`);

        for (let i = 0; i < 10; i++) {
            const firstName = firstNames[getRandomInt(0, firstNames.length - 1)];
            const lastName = lastNames[getRandomInt(0, lastNames.length - 1)];
            const username = `${firstName}${getRandomInt(100, 999)}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 10000)}@example.com`;
            const balance = getRandomInt(0, 1000); 

            stmtUsers.run(username, email, hashedPassword, balance);
            
            // AJOUT DE L'EMAIL ICI
            fileContent += `Nom     : ${username}\n`;
            fileContent += `Email   : ${email}\n`; // <--- C'est ajouté !
            fileContent += `Pass    : ${passwordClear}\n`;
            fileContent += `Solde   : ${balance} €\n`;
            fileContent += `--------------------------\n`;
        }
        stmtUsers.finalize();
        
        fs.writeFileSync(logFilePath, fileContent);
        console.log(`✅ Identifiants sauvegardés dans : ${logFilePath}`);

        // --- ÉTAPE 2 : CRÉATION DES ENCHÈRES ---
        db.all("SELECT id FROM users", (err, rows) => {
            if (err) return console.error(err);
            const userIds = rows.map(row => row.id);
            
            if (userIds.length > 0) {
                console.log("📦 Création des enchères...");
                const stmtAuctions = db.prepare(`
                    INSERT INTO auctions (title, description, starting_price, current_price, end_date, user_id, image_url) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);

                for (let i = 0; i < 50; i++) {
                    const title = `${adj[getRandomInt(0, adj.length - 1)]} ${noun[getRandomInt(0, noun.length - 1)]}`;
                    const price = getRandomInt(10, 500);
                    const daysToAdd = getRandomInt(1, 30);
                    const date = new Date();
                    date.setDate(date.getDate() + daysToAdd);
                    const randomUserId = userIds[getRandomInt(0, userIds.length - 1)];

                    let imageUrl = "";
                    if (availableImages.length > 0) {
                        const randomImageName = availableImages[getRandomInt(0, availableImages.length - 1)];
                        // On force le format /uploads/nom_image.jpg
                        imageUrl = `/uploads/${randomImageName}`;
                    }

                    stmtAuctions.run(
                        title, 
                        "Description générée automatiquement.", 
                        price, 
                        price, 
                        date.toISOString(), 
                        randomUserId, 
                        imageUrl
                    );
                }
                stmtAuctions.finalize();
                console.log("✅ 50 Enchères ajoutées.");
            }
            db.close();
        });
    });
};

seedDatabase();