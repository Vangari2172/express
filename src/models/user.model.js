import mongoose from 'mongoose';

// 1. Define the User Schema
// This is the structure of the document that will be stored in the User collection.
const userSchema = new mongoose.Schema(
  {
    // Mongoose automatically creates a unique `_id` for each document.
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true, // Ensures no two users can have the same email.
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address.'],
    },
    phone: {
      type: String,
      trim: true,
      // Optional: Add a match validator for phone numbers if needed
      // match: [/^\d{10}$/, 'Phone number must be 10 digits.']
    },
    age: {
      type: Number,
      min: [1, 'Age must be a positive number.'],
      max: [120, 'Age cannot be more than 120.'],
    },
  },
  {
    // 2. Define Schema Options
    // `timestamps: true` automatically adds `createdAt` and `updatedAt` fields.
    timestamps: true,
  }
);

// 3. Create the User Model
// A Mongoose model provides an interface to the database for creating, querying, updating, and deleting documents.
// The first argument is the singular name of the collection your model is for.
// Mongoose automatically looks for the plural, lowercased version of your model name.
// So, for 'User', the collection will be 'users'.
export const User = mongoose.model('User', userSchema);
