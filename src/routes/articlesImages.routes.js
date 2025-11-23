import { Router } from "express";
import { isLogged } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

/**
 * 
 * Créez un fichier src/db/articles.js avec au minimum ces fonctions :
 *
 *  - async function findArticleById(articleId)
 *      -> retourne un objet { id, title, owner_id, ... } ou null
 *
 *  - async function insertArticleImage({ articleId, filename })
 *      -> insère en DB et retourne l'image créée
 *
 *  - async function selectImagesForArticle(articleId)
 *      -> retourne un tableau d'images [{ id, article_id, filename, created_at, ... }]
 */
import {
  findArticleById,
  insertArticleImage,
  selectImagesForArticle,
} from "../db/articles.js";

export const articleImagesRouter = Router();

/**
 * POST /api/articles/:id/images
 * Upload d'une image pour un article.
 * - utilisateur doit être connecté (isLogged)
 * - utilisateur doit être propriétaire de l'article  
 * - image envoyée sous le champ "image" (form-data)
 */
articleImagesRouter.post( //démarre une route post
  "/articles/:id/images",
  isLogged,
  // "image" = nom du champ dans le form-data
  upload.single("image"), //multer cherche un fichier sur le champ "image" 
  async (req, res, next) => {
    try {
      const articleId = Number(req.params.id); // convertit l'id en nombre
      const userId = req.user?.id; // recupère l'id de l'utilisateur à partir du JWT décodé par isLogged

      if (!Number.isInteger(articleId)) {
        return res.status(400).json({ error: "ID d'article invalide" });
      }

      // Vérifier que le fichier est bien présent
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier reçu" });
      }

      // Récupérer l'article
      const article = await findArticleById(articleId);
      if (!article) {
        return res.status(404).json({ error: "Article introuvable" });
      }

      // Vérifier que l'utilisateur connecté est propriétaire
      if (article.user_id !== userId) {
        return res
          .status(403)
          .json({ error: "Vous n'êtes pas propriétaire de cet article" });
      }

      // Enregistrer l'image en DB
      const savedImage = await insertArticleImage({
        articleId,
        filename: req.file.filename,
      });

      return res.status(201).json({
        message: "Image uploadée avec succès",
        image: savedImage,
      });
    } catch (error) {
      // erreur envoyé par multer
      if (error instanceof Error && error.message.includes("Type de fichier")) {
        return res.status(400).json({ error: error.message });
      }
      return next(error);
    }
  }
);

/**
 * GET /api/articles/:id/images
 * Récupérer les images d'un article.
 * - ici on impose isLogged par défaut
 */
articleImagesRouter.get(
  "/articles/:id/images",
  isLogged,
  async (req, res, next) => {
    try {
      const articleId = Number(req.params.id);

      if (!Number.isInteger(articleId)) {
        return res.status(400).json({ error: "ID d'article invalide" });
      }

      const article = await findArticleById(articleId);
      if (!article) {
        return res.status(404).json({ error: "Article introuvable" });
      }
      const images = await selectImagesForArticle(articleId);

      return res.json({
        articleId,
        images,
      });
    } catch (error) {
      return next(error);
    }
  }
);