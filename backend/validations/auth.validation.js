import Joi from "joi"

//Signup validation
export const signupSchema = Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .trim()
        .required(),

    password: Joi.string()
        .min(6) // strong baseline length
        .max(128)
        .pattern(/[a-z]/, 'lowercase letter')
        .pattern(/[A-Z]/, 'uppercase letter')
        .pattern(/[0-9]/, 'number')
        .pattern(/[^a-zA-Z0-9]/, 'special character')
        .required()
        .messages({
            'string.base': '-Password must be a string\n',
            'string.empty': '-Password cannot be empty\n',
            'string.min': '-Password must be at least 12 characters long\n',
            'string.max': '-Password must not exceed 128 characters\n',
            'string.pattern.name': '-Password must contain at least one {#name}\n',
            'any.required': '-Password is required\n'
        })
});


// Login Validation
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required(),

  password: Joi.string()
    .required(),
});


