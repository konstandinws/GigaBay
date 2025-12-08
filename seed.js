import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "database.sqlite");

const db = new sqlite3.Database(dbPath);

const adj = ["Ancien", "Superbe", "Rare", "Magnifique", "Puissant", "Vintage", "Cassé", "Neuf"];
const noun = ["Canapé", "Ordinateur", "Vélo", "Tableau", "Smartphone", "Montre", "Voiture", "Console"];
const users = [1]; // Assurez-vous d'avoir au moins un utilisateur avec l'ID 1 dans la base

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateAuctions = () => {
    console.log("🌱 Génération des enchères...");
    
    db.serialize(() => {
        const stmt = db.prepare(`
            INSERT INTO auctions (title, description, starting_price, current_price, end_date, user_id, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (let i = 0; i < 50; i++) {
            const title = `${adj[getRandomInt(0, adj.length - 1)]} ${noun[getRandomInt(0, noun.length - 1)]}`;
            const price = getRandomInt(10, 500);
            const daysToAdd = getRandomInt(1, 30);
            const date = new Date();
            date.setDate(date.getDate() + daysToAdd);
            
            stmt.run(
                title,
                "Ceci est une description générée automatiquement pour le test.",
                price,
                price, // current_price commence au starting_price
                date.toISOString(),
                1, // On assigne tout à l'utilisateur ID 1 pour simplifier
                "" // Pas d'image par défaut
            );
        }

        stmt.finalize();
        console.log("✅ 50 enchères ajoutées avec succès !");
    });

    db.close();
};

generateAuctions();