import Joi from 'joi';
import { apiError } from '../utils/apiResponse.js';

// Joi schema for creating a new user
const createUserSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  age: Joi.number().integer().min(1).max(120).optional(),
});

// Joi schema for updating an existing user
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  age: Joi.number().integer().min(1).max(120).optional(),
}).min(1); // Ensure at least one field is being updated

// Middleware function to validate request body against a schema
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    // Extract and format the error message
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return apiError(res, 400, 'Validation Error', errorMessage);
  }

  return next();
};

export const validateCreateUser = validate(createUserSchema);
export const validateUpdateUser = validate(updateUserSchema);
