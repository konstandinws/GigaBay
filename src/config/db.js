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

export default db;
