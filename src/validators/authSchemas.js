import Joi from "joi";

// Schéma pour l'inscription
export const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).alphanum().required()
        .messages({
            'string.min': 'Le nom d\'utilisateur doit faire au moins 3 caractères',
            'string.alphanum': 'Le nom d\'utilisateur ne doit contenir que des lettres et chiffres'
        }),
    email: Joi.string().email().required()
        .messages({
            'string.email': 'L\'email doit être valide'
        }),
    password: Joi.string().min(6).required()
});

// Schéma pour la connexion
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});