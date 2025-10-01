import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import userRoutes from "./src/routes/user.routes.js"

// Import API response utilities
import { apiSuccess, apiError } from "./src/utils/apiResponse.js"
import { errorHandler } from "./src/middleware/error.middleware.mjs"

// Load environment variables from .env file in the root directory
dotenv.config()

import connectDB from "./src/db/index.js"
const app = express()
const PORT = process.env.PORT || 3000

// Middleware setup
// 1. Security middleware - helmet helps secure Express apps by setting various HTTP headers
app.use(helmet())

// 2. CORS middleware - allows cross-origin requests (useful for Postman/frontend)
app.use(cors())

// 3. Morgan middleware - logs HTTP requests to console (great for debugging)
app.use(morgan("dev"))

// 4. Body parsing middleware - parses JSON bodies from requests
// This is crucial for receiving data from Postman requests
app.use(express.json({ limit: "10mb" })) // Allows JSON payloads up to 10MB
app.use(express.urlencoded({ extended: true })) // Allows form data

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error connecting to database", error)
      throw error
    })
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`)
    })
  })
  .catch((err) => console.log("Error connecting to database", err))

// Routes
// All file system operations will be available under /api/fs
app.use("/api/users", userRoutes)

// Global Error Handling Middleware
// This should be the last middleware registered
app.use(errorHandler)

// Health check route - useful to verify server is running
app.get("/health", (req, res) => {
  return apiSuccess(res, 200, "File System CRUD Server is running!", {
    status: "OK",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  })
})

export default app
