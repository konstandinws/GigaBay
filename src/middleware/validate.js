const validate = (schema) => {
    return (req, res, next) => {
        // On valide le corps de la requête (req.body) avec le schéma fourni
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            // Si erreur, on renvoie une 400 avec les détails
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({ 
                status: "error",
                message: "Données invalides",
                errors: errors 
            });
        }

        // Si tout est bon, on passe au contrôleur suivant
        next();
    };
};

export default validate;