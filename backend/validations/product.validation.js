import Joi from "joi";

// Mongo ObjectId validation
const objectId = Joi.string().length(24).hex();

// Create Product
export const createProductSchema = Joi.object({
    name: Joi.string().min(3).max(100).trim().required(),

    description: Joi.string().max(1000).trim().required(),

    price: Joi.number().positive().required(),

    image: Joi.string().uri().required(),

    category: Joi.string().min(2).max(50).trim().required(),
})

//Params ID
export const productIdParamSchema = Joi.object({
    id: objectId.required()
    
});

//Params: Category
export const categoryParamSchema = Joi.object({
    category: Joi.string().min(2).max(50).trim().required()
    
});