import Joi from "joi";

// Mongo ObjectId
const objectId = Joi.string().length(24).hex();

// Add to cart
export const addToCartSchema = Joi.object({
  productId: objectId.required(),
});

// Remove from cart
export const removeFromCartSchema = Joi.object({
  productId: objectId.optional(), // optional → empty cart case
});

// Update quantity
export const updateQuantitySchema = Joi.object({
  quantity: Joi.number()
    .integer()
    .min(0)      // 0 means remove
    .max(10)     // 🔐 limit to prevent abuse
    .required()
    .messages({
      "number.base": "Quantity must be a number",
      "number.min": "Quantity cannot be negative",
      "number.max": "Max quantity allowed is 10",
    }),
});

// Params validation
export const productIdParamSchema = Joi.object({
  id: objectId.required(),
});