import { Router } from "express"
const router = Router()

// Import our file system service
import * as fsService from "../src/services/fsService.js"

// Import API response wrapper
import { apiSuccess, apiError } from "../utils/apiResponse.js"

/**
 * File System Routes
 *
 * These routes handle HTTP requests for file operations.
 * Each route uses async/await with proper error handling.
 */

// POST /api/fs/create - Create a new file
router.post("/create", async (req, res) => {
  try {
    // Extract filename and content from request body
    // In Postman, send JSON like: {"filename": "test.txt", "content": "Hello World!"}
    const { filename, content } = req.body

    // Validate required fields
    if (!filename || !content) {
      return apiError(
        res,
        400,
        "Validation Error",
        "Both filename and content are required"
      )
    }

    // Call the service function (which returns a Promise)
    const result = await fsService.createFile(filename, content)

    // Send success response
    return apiSuccess(res, 201, "File created successfully!", result)
  } catch (error) {
    // Handle errors gracefully
    console.error("Error in create route:", error)

    // Send appropriate error response based on error type
    if (error.message.includes("already exists")) {
      return apiError(res, 409, "Conflict", error.message)
    } else if (error.message.includes("required")) {
      return apiError(res, 400, "Validation Error", error.message)
    } else {
      return apiError(
        res,
        500,
        "Internal Server Error",
        "Failed to create file"
      )
    }
  }
})

// GET /api/fs/read - Read a file
router.get("/read", async (req, res) => {
  try {
    // Extract filename from query parameters
    // In Postman: GET http://localhost:3000/api/fs/read?filename=test.txt
    const { filename } = req.query

    if (!filename) {
      return apiError(
        res,
        400,
        "Validation Error",
        "Filename is required as query parameter"
      )
    }

    const result = await fsService.readFile(filename)

    return apiSuccess(res, 200, "File read successfully!", result)
  } catch (error) {
    console.error("Error in read route:", error)

    if (error.message.includes("not found")) {
      return apiError(res, 404, "File not found", error.message)
    } else {
      return apiError(res, 500, "Internal Server Error", "Failed to read file")
    }
  }
})

// PUT /api/fs/append - Append content to a file
router.put("/append", async (req, res) => {
  try {
    const { filename, content } = req.body

    if (!filename || !content) {
      return apiError(
        res,
        400,
        "Validation Error",
        "Both filename and content are required",
        {
          example: {
            filename: "myfile.txt",
            content: "Additional content to append...",
          },
        }
      )
    }

    const result = await fsService.appendToFile(filename, content)

    return apiSuccess(res, 200, "Content appended successfully!", result)
  } catch (error) {
    console.error("Error in append route:", error)

    if (error.message.includes("not found")) {
      return apiError(res, 404, "File not found", error.message)
    } else if (error.message.includes("required")) {
      return apiError(res, 400, "Validation Error", error.message)
    } else {
      return apiError(
        res,
        500,
        "Internal Server Error",
        "Failed to append to file"
      )
    }
  }
})

// DELETE /api/fs/delete - Delete a file
router.delete("/delete", async (req, res) => {
  try {
    const { filename } = req.body

    if (!filename) {
      return apiError(
        res,
        400,
        "Validation Error",
        "Filename is required in request body",
        {
          example: { filename: "myfile.txt" },
        }
      )
    }

    const result = await fsService.deleteFile(filename)

    return apiSuccess(res, 200, "File deleted successfully!", result)
  } catch (error) {
    console.error("Error in delete route:", error)

    if (error.message.includes("not found")) {
      return apiError(res, 404, "File not found", error.message)
    } else {
      return apiError(
        res,
        500,
        "Internal Server Error",
        "Failed to delete file"
      )
    }
  }
})

// GET /api/fs/list - List all files
router.get("/list", async (req, res) => {
  try {
    const result = await fsService.listFiles()

    return apiSuccess(res, 200, "Files retrieved successfully!", result)
  } catch (error) {
    console.error("Error in list route:", error)

    return apiError(res, 500, "Internal Server Error", "Failed to list files")
  }
})

// Additional helpful route - get file info without content
router.get("/info", async (req, res) => {
  try {
    const { filename } = req.query

    if (!filename) {
      return apiError(
        res,
        400,
        "Validation Error",
        "Filename is required as query parameter",
        {
          example: { filename: "myfile.txt" },
        }
      )
    }

    // Read file but only return metadata, not content
    const fullData = await fsService.readFile(filename)

    // Remove content from response for security
    const { content, ...fileInfo } = fullData

    return apiSuccess(res, 200, "File info retrieved successfully!", fileInfo)
  } catch (error) {
    console.error("Error in info route:", error)

    if (error.message.includes("not found")) {
      return apiError(res, 404, "File not found", error.message)
    } else {
      return apiError(
        res,
        500,
        "Internal Server Error",
        "Failed to get file info"
      )
    }
  }
})

export default router
