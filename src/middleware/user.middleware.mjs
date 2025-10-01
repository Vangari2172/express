import { getUserByIdService } from '../services/user.service.js';
import { apiError } from '../utils/apiResponse.js';
import mongoose from 'mongoose';

/**
 * Middleware to check if a user exists by ID.
 * If the user is found, it attaches the user document to `req.user`.
 * If not found or if the ID is invalid, it sends an appropriate error response.
 */
export const checkUserExists = async (req, res, next) => {
  const { id } = req.params;

  // 1. Check if the provided ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return apiError(res, 400, 'Invalid ID', 'The provided user ID is not a valid format.');
  }

  try {
    // 2. Attempt to find the user in the database
    const user = await getUserByIdService(id);

    // 3. If no user is found, send a 404 error
    if (!user) {
      return apiError(res, 404, 'Not Found', 'User with this ID does not exist.');
    }

    // 4. If the user is found, attach it to the request object
    req.user = user;

    // 5. Pass control to the next middleware or route handler
    next();
  } catch (error) {
    // Handle any unexpected errors during the database query
    return apiError(res, 500, 'Server Error', error.message);
  }
};