import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

const fileMiddleware = (req, res) => {
    const filename = req.params.filename;

    // On vérifie d'où vient la requête (le "Referer")
    const referer = req.headers.referer;
    const host = req.headers.host;

    // Si on n'a pas de referer (accès direct via barre d'adresse) 
    // OU si le referer ne contient pas notre adresse de site -> ON BLOQUE
    if (!referer || !referer.includes(host)) {
        return res.status(403).json({ message: "Accès direct interdit" });
    }


    const safeFilename = path.basename(filename);
    const filepath = path.join(UPLOAD_DIR, safeFilename);
    
    fs.access(filepath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ message: "Fichier introuvable" });
        }

        const ext = path.extname(safeFilename).toLowerCase();
        if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
            return res.status(403).json({ message: "Extension interdite" });
        }

        res.sendFile(filepath);
    });
};

export default fileMiddleware;