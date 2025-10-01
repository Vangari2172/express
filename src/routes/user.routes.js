import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { checkUserExists } from '../middleware/user.middleware.mjs';

const router = Router();

// --- Public Routes ---
// Maps HTTP methods to controller functions.

// POST /api/users
router.route('/').post(createUser);

// GET /api/users
router.route('/').get(getAllUsers);


// --- Routes for a specific user (/:id) ---

// Apply the 'checkUserExists' middleware to all routes with an '/:id'.
// This middleware will run before the controller, ensuring the user exists.
router.use('/:id', checkUserExists);

// GET, PUT, and DELETE /api/users/:id
router.route('/:id')
  .get(getUserById)    // Maps to getUserById controller
  .put(updateUser)     // Maps to updateUser controller
  .delete(deleteUser); // Maps to deleteUser controller

export default router;
