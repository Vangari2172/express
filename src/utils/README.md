# API Response Wrapper

This utility provides a standardized way to format API responses across your Express application.

## Features

- ✅ Consistent response structure
- ✅ Built-in error handling
- ✅ Validation error formatting
- ✅ Async route handler wrapper
- ✅ Global error handler middleware
- ✅ Pagination support
- ✅ Development-friendly error details

## Usage Examples

### Basic Success Response

```javascript
const { ApiResponse } = require("../utils/apiResponse")

// Simple success
ApiResponse.success(res, 200, "File created successfully", fileData)

// Created resource
ApiResponse.created(res, "User created successfully", userData)
```

### Error Responses

```javascript
// Validation error
ApiResponse.validationError(
  res,
  "Missing required fields",
  {
    filename: "Filename is required",
    content: "Content cannot be empty",
  },
  {
    filename: "example.txt",
    content: "File content here",
  }
)

// Not found
ApiResponse.notFound(res, "File", "The requested file does not exist")

// Conflict
ApiResponse.conflict(res, "File already exists")

// Server error
ApiResponse.serverError(res, "Failed to process file", error)
```

### Using Async Handler

```javascript
const { ApiResponse, asyncHandler } = require("../utils/apiResponse")

router.get(
  "/files",
  asyncHandler(async (req, res) => {
    const files = await fsService.listFiles()
    return ApiResponse.success(res, 200, "Files retrieved successfully", files)
  })
)
```

### Response Structure

All responses follow this consistent structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2023-10-01T12:23:31.000Z",
  "statusCode": 200
}
```

Error responses:

```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Missing required fields",
  "timestamp": "2023-10-01T12:23:31.000Z",
  "statusCode": 400,
  "validationErrors": {
    "filename": "Filename is required"
  },
  "example": {
    "filename": "example.txt"
  }
}
```

## Integration

1. Import the wrapper in your routes:

```javascript
const { ApiResponse, asyncHandler } = require("../utils/apiResponse")
```

2. Replace manual response formatting with wrapper methods

## Available Methods

- `success(res, statusCode, message, data, meta)` - Success responses
- `error(res, statusCode, error, message, details, suggestions)` - Generic errors
- `validationError(res, message, validationErrors, example)` - Validation errors
- `notFound(res, resource, message)` - 404 errors
- `conflict(res, message, suggestions)` - 409 conflicts
- `unauthorized(res, message)` - 401 unauthorized
- `forbidden(res, message)` - 403 forbidden
- `serverError(res, message, error)` - 500 server errors
- `created(res, message, data)` - 201 created
- `noContent(res)` - 204 no content
- `paginated(res, data, pagination, message)` - Paginated responses
