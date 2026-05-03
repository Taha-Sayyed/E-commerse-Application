export const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: false,   // 🔥 blocks extra fields (VERY IMPORTANT)
        stripUnknown: true,    // removes unwanted fields
    });

    if (error) {
        return res.status(400).json({
            message: error.details.map((e) => e.message),
        });
    }

    req.body = value; // sanitized
    next();

}