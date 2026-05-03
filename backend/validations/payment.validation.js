import Joi from "joi";

// product schema inside checkout
const productSchema = Joi.object({
  _id: Joi.string().length(24).hex().required(),
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(1).required(),
  image: Joi.string().optional().allow(""),
});

// create checkout session
export const createCheckoutSchema = Joi.object({
  products: Joi.array().items(productSchema).min(1).required(),

  couponCode: Joi.string().alphanum().min(3).max(20).optional(),
});


// checkout success
export const checkoutSuccessSchema = Joi.object({
  sessionId: Joi.string().required(), // Stripe session ID
});