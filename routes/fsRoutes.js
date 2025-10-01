const express = require('express');
const router = express.Router();

// Import our file system service
const fsService = require('../services/fsService');

/**
 * File System Routes
 *
 * These routes handle HTTP requests for file operations.
 * Each route uses async/await with proper error handling.
 */

// POST /api/fs/create - Create a new file
router.post('/create', async (req, res) => {
  try {
    // Extract filename and content from request body
    // In Postman, send JSON like: {"filename": "test.txt", "content": "Hello World!"}
    const { filename, content } = req.body;

    // Validate required fields
    if (!filename || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both filename and content are required',
        example: {
          filename: 'myfile.txt',
          content: 'File content goes here...'
        }
      });
    }

    // Call the service function (which returns a Promise)
    const result = await fsService.createFile(filename, content);

    // Send success response
    res.status(201).json({
      message: 'File created successfully!',
      data: result
    });

  } catch (error) {
    // Handle errors gracefully
    console.error('Error in create route:', error);

    // Send appropriate error response based on error type
    if (error.message.includes('already exists')) {
      res.status(409).json({
        error: 'File already exists',
        message: error.message
      });
    } else if (error.message.includes('required')) {
      res.status(400).json({
        error: 'Invalid input',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create file'
      });
    }
  }
});

// GET /api/fs/read - Read a file
router.get('/read', async (req, res) => {
  try {
    // Extract filename from query parameters
    // In Postman: GET http://localhost:3000/api/fs/read?filename=test.txt
    const { filename } = req.query;

    if (!filename) {
      return res.status(400).json({
        error: 'Missing filename',
        message: 'Filename is required as query parameter',
        example: '/api/fs/read?filename=myfile.txt'
      });
    }

    const result = await fsService.readFile(filename);

    res.status(200).json({
      message: 'File read successfully!',
      data: result
    });

  } catch (error) {
    console.error('Error in read route:', error);

    if (error.message.includes('not found')) {
      res.status(404).json({
        error: 'File not found',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to read file'
      });
    }
  }
});

// PUT /api/fs/append - Append content to a file
router.put('/append', async (req, res) => {
  try {
    const { filename, content } = req.body;

    if (!filename || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both filename and content are required',
        example: {
          filename: 'myfile.txt',
          content: 'Additional content to append...'
        }
      });
    }

    const result = await fsService.appendToFile(filename, content);

    res.status(200).json({
      message: 'Content appended successfully!',
      data: result
    });

  } catch (error) {
    console.error('Error in append route:', error);

    if (error.message.includes('not found')) {
      res.status(404).json({
        error: 'File not found',
        message: error.message
      });
    } else if (error.message.includes('required')) {
      res.status(400).json({
        error: 'Invalid input',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to append to file'
      });
    }
  }
});

// DELETE /api/fs/delete - Delete a file
router.delete('/delete', async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        error: 'Missing filename',
        message: 'Filename is required in request body',
        example: { filename: 'myfile.txt' }
      });
    }

    const result = await fsService.deleteFile(filename);

    res.status(200).json({
      message: 'File deleted successfully!',
      data: result
    });

  } catch (error) {
    console.error('Error in delete route:', error);

    if (error.message.includes('not found')) {
      res.status(404).json({
        error: 'File not found',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete file'
      });
    }
  }
});

// GET /api/fs/list - List all files
router.get('/list', async (req, res) => {
  try {
    const result = await fsService.listFiles();

    res.status(200).json({
      message: 'Files retrieved successfully!',
      data: result
    });

  } catch (error) {
    console.error('Error in list route:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to list files'
    });
  }
});

// Additional helpful route - get file info without content
router.get('/info', async (req, res) => {
  try {
    const { filename } = req.query;

    if (!filename) {
      return res.status(400).json({
        error: 'Missing filename',
        message: 'Filename is required as query parameter'
      });
    }

    // Read file but only return metadata, not content
    const fullData = await fsService.readFile(filename);

    // Remove content from response for security
    const { content, ...fileInfo } = fullData;

    res.status(200).json({
      message: 'File info retrieved successfully!',
      data: fileInfo
    });

  } catch (error) {
    console.error('Error in info route:', error);

    if (error.message.includes('not found')) {
      res.status(404).json({
        error: 'File not found',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get file info'
      });
    }
  }
});

module.exports = router;
