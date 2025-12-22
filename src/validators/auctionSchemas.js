import Joi from "joi";

export const createAuctionSchema = Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().allow('').optional(), // Autorise vide
    price: Joi.number().positive().required()
        .messages({
            'number.positive': 'Le prix doit être supérieur à 0'
        }),
    end_date: Joi.date().greater('now').required()
        .messages({
            'date.greater': 'La date de fin doit être dans le futur'
        })
});