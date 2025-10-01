import { User } from '../models/user.model.js';

/**
 * Creates a new user in the database.
 * @param {object} userData - The data for the new user.
 * @returns {Promise<object>} The newly created user document.
 */
export const createUserService = async (userData) => {
  // Check if a user with the same email already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error('A user with this email address already exists.');
    error.statusCode = 409; // Conflict
    throw error;
  }

  // `User.create` builds and saves a new document, running schema validations
  const newUser = await User.create(userData);
  return newUser;
};

/**
 * Retrieves all users from the database.
 * @returns {Promise<Array<object>>} An array of user documents.
 */
export const getUsersService = async () => {
  // `User.find({})` retrieves all documents from the 'users' collection.
  const users = await User.find({})
  return users
}

/**
 * Retrieves a single user by their ID.
 * @param {string} id - The ID of the user to retrieve.
 * @returns {Promise<object>} The user document.
 */
export const getUserByIdService = async (id) => {
  // `User.findById` is a convenient Mongoose method for finding a document by its _id.
  const user = await User.findById(id)
  if (!user) {
    throw new Error("User not found")
  }
  return user
}

/**
 * Updates a user in the database.
 * @param {string} id - The ID of the user to update.
 * @param {object} updates - An object containing the fields to update.
 * @returns {Promise<object>} The updated user document.
 */
export const updateUserService = async (id, updates) => {
  // `User.findByIdAndUpdate` finds a document by ID and updates it.
  // The `{ new: true, runValidators: true }` options are important:
  // `new: true` ensures the method returns the updated document, not the original one.
  // `runValidators: true` ensures that updates are validated against the schema.
  const updatedUser = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })

  if (!updatedUser) {
    throw new Error("User not found")
  }

  return updatedUser
}

/**
 * Deletes a user from the database.
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<object>} The deleted user document.
 */
export const deleteUserService = async (id) => {
  // `User.findByIdAndDelete` finds a document by ID and removes it.
  const deletedUser = await User.findByIdAndDelete(id)

  if (!deletedUser) {
    throw new Error("User not found")
  }

  return deletedUser
}
