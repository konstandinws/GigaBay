import multer from "multer"; //multer pour upload
import path from "path";  //manipuler les chemins de fichiers
import fs from "fs";  //travaille avec le système de fichiers
import { fileURLToPath } from "url";   //convertit import.meta.url en chemin de fichier

// Équivalent de __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dossier où seront stockées les images
export const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

// Création du dossier s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuration du stockage disques      
const storage = multer.diskStorage({  // stocke les fichiers sur le disque
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {  // definit le nom du fichier sur le disque
    const originalName = file.originalname;  // nom envoyé par le client
    const ext = path.extname(originalName).toLowerCase(); //récupère l'extension et le met en miniscule
    const baseName = path
      .basename(originalName, ext) // récupère le nom sans l'extension
      .replace(/\s+/g, "-") // remplace des espaces par des -
      .replace(/[^a-zA-Z0-9-_]/g, ""); // enlève les symboles

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);  //crée un bout de texte unique pour le nom du fichier
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);   // nom final du fichier
  },
});

// Types MIME autorisés
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

function fileFilter(req, file, cb) {  // fonction utiliser par multer pour appeler les fichiers recus
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {   //si le type de fichiers n'est pas contenu dans la liste
    const error = new Error("Type de fichier non autorisé");
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true); // sinon tout est correct
}

//middleware multer
export const upload = multer({
  storage,  // ou et comment enregistrer les fichiers 
  fileFilter,  //autorisations
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 Mo  // taille max du fichier
  },
});
