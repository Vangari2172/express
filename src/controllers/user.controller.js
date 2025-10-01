import {
  createUserService,
  getUsersService,
  updateUserService,
  deleteUserService,
} from '../services/user.service.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

// Controller to create a new user
const createUser = async (req, res) => {
  console.log('Attempting to create a new user...');
  try {
    const newUser = await createUserService(req.body);
    console.log('User created successfully:', newUser._id);
    return apiSuccess(res, 201, 'User created successfully', newUser);
  } catch (error) {
    console.error('Error in createUser controller:', error.message);
    // Handle validation errors (400) or duplicate key errors (409)
    const statusCode = error.code === 11000 ? 409 : 400;
    return apiError(res, statusCode, 'Create User Failed', error.message);
  }
};

// Controller to get all users
const getAllUsers = async (req, res) => {
  console.log('Attempting to retrieve all users...');
  try {
    const users = await getUsersService();
    console.log(`Retrieved ${users.length} users.`);
    return apiSuccess(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    console.error('Error in getAllUsers controller:', error.message);
    return apiError(res, 500, 'Server Error', 'Failed to retrieve users.');
  }
};

// Controller to get a single user by ID
const getUserById = async (req, res) => {
  // The middleware (checkUserExists) has already found the user and handled errors.
  // The user is available on req.user.
  console.log(`Retrieving user by ID: ${req.user._id}`);
  return apiSuccess(res, 200, 'User retrieved successfully', req.user);
};

// Controller to update a user
const updateUser = async (req, res) => {
  const { id } = req.params;
  console.log(`Attempting to update user: ${id}`);
  try {
    const updatedUser = await updateUserService(id, req.body);
    console.log(`User updated successfully: ${updatedUser._id}`);
    return apiSuccess(res, 200, 'User updated successfully', updatedUser);
  } catch (error) {
    console.error(`Error in updateUser controller for user ${id}:`, error.message);
    // Handle validation errors
    return apiError(res, 400, 'Update User Failed', error.message);
  }
};

// Controller to delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  console.log(`Attempting to delete user: ${id}`);
  try {
    await deleteUserService(id);
    console.log(`User deleted successfully: ${id}`);
    return apiSuccess(res, 200, 'User deleted successfully');
  } catch (error) {
    console.error(`Error in deleteUser controller for user ${id}:`, error.message);
    return apiError(res, 500, 'Server Error', 'Failed to delete user.');
  }
};

export {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
