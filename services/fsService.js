const fs = require('fs').promises;
const path = require('path');

/**
 * File System Service Module
 *
 * This module provides CRUD operations for files using:
 * - fs.promises API (Promise-based file system operations)
 * - async/await syntax for cleaner, more readable code
 * - Proper error handling with try-catch blocks
 * - Special JSON array handling for .json files
 */

// Directory where files will be stored
const FILES_DIR = path.join(__dirname, 'files');

// Ensure the files directory exists
const ensureDirectoryExists = async () => {
  try {
    await fs.access(FILES_DIR);
  } catch (error) {
    // Directory doesn't exist, create it
    if (error.code === 'ENOENT') {
      await fs.mkdir(FILES_DIR, { recursive: true });
      console.log(`📁 Created files directory: ${FILES_DIR}`);
    } else {
      throw error;
    }
  }
};

// Initialize directory on module load
ensureDirectoryExists();

/**
 * Check if filename is a JSON file
 * @param {string} filename - Name of the file
 * @returns {boolean} - True if file has .json extension
 */
const isJsonFile = (filename) => {
  return filename.toLowerCase().endsWith('.json');
};

/**
 * Convert object to array if it's not already an array
 * @param {any} data - Data to convert
 * @returns {Array} - Array version of the data
 */
const ensureArray = (data) => {
  return Array.isArray(data) ? data : [data];
};

/**
 * Create a new file
 * @param {string} filename - Name of the file to create
 * @param {string} content - Content to write to the file
 * @returns {Promise<Object>} - Success message with file details
 */
const createFile = async (filename, content) => {
  try {
    // Validate inputs
    if (!filename || !content) {
      throw new Error('Filename and content are required');
    }

    // Clean filename (remove any path traversal attempts)
    const cleanFilename = path.basename(filename);

    // Create full file path
    const filePath = path.join(FILES_DIR, cleanFilename);

    // Check if file already exists
    try {
      await fs.access(filePath);
      throw new Error(`File '${cleanFilename}' already exists`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error; // Re-throw if it's not a "file doesn't exist" error
      }
      // File doesn't exist, we can create it
    }

    // Write file using fs.promises.writeFile()
    // This returns a Promise, so we can use await
    await fs.writeFile(filePath, content, 'utf8');

    console.log(`✅ File created: ${cleanFilename}`);

    return {
      success: true,
      message: `File '${cleanFilename}' created successfully`,
      filename: cleanFilename,
      size: Buffer.byteLength(content, 'utf8'),
      path: filePath
    };
  } catch (error) {
    console.error(`❌ Error creating file '${filename}':`, error.message);
    throw error;
  }
};

/**
 * Read a file
 * @param {string} filename - Name of the file to read
 * @returns {Promise<Object>} - File content and metadata
 */
const readFile = async (filename) => {
  try {
    // Validate input
    if (!filename) {
      throw new Error('Filename is required');
    }

    const cleanFilename = path.basename(filename);
    const filePath = path.join(FILES_DIR, cleanFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File '${cleanFilename}' not found`);
      }
      throw error;
    }

    // Read file using fs.promises.readFile()
    // Returns a Promise that resolves with the file content
    const content = await fs.readFile(filePath, 'utf8');

    // Get file stats for additional metadata
    const stats = await fs.stat(filePath);

    console.log(`✅ File read: ${cleanFilename}`);

    return {
      success: true,
      filename: cleanFilename,
      content: content,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      path: filePath
    };
  } catch (error) {
    console.error(`❌ Error reading file '${filename}':`, error.message);
    throw error;
  }
};

/**
 * Append content to an existing file
 * @param {string} filename - Name of the file to append to
 * @param {string} content - Content to append
 * @returns {Promise<Object>} - Success message with updated file details
 */
const appendToFile = async (filename, content) => {
  try {
    // Validate inputs
    if (!filename || !content) {
      throw new Error('Filename and content are required');
    }

    const cleanFilename = path.basename(filename);
    const filePath = path.join(FILES_DIR, cleanFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File '${cleanFilename}' not found. Use create endpoint first.`);
      }
      throw error;
    }

    // Special handling for JSON files
    if (isJsonFile(cleanFilename)) {
      return await appendToJsonFile(filePath, content, cleanFilename);
    }

    // Append to file using fs.promises.appendFile()
    // This adds content to the end of the file without overwriting existing content
    await fs.appendFile(filePath, content, 'utf8');

    // Get updated file stats
    const stats = await fs.stat(filePath);

    console.log(`✅ Content appended to file: ${cleanFilename}`);

    return {
      success: true,
      message: `Content appended to '${cleanFilename}' successfully`,
      filename: cleanFilename,
      newSize: stats.size,
      path: filePath
    };
  } catch (error) {
    console.error(`❌ Error appending to file '${filename}':`, error.message);
    throw error;
  }
};

/**
 * Special handling for appending to JSON files as arrays
 * @param {string} filePath - Full path to the JSON file
 * @param {string} newContent - New content to append
 * @param {string} cleanFilename - Clean filename for logging
 * @returns {Promise<Object>} - Success message with updated file details
 */
const appendToJsonFile = async (filePath, newContent, cleanFilename) => {
  try {
    // Read current file content
    const currentContent = await fs.readFile(filePath, 'utf8');
    
    // Parse current JSON content
    let currentData;
    try {
      currentData = JSON.parse(currentContent);
    } catch (parseError) {
      throw new Error(`Invalid JSON format in file '${cleanFilename}'`);
    }

    // Parse new content as JSON
    let newData;
    try {
      // Remove any existing quotes if it's already a JSON string
      const cleanNewContent = newContent.trim().replace(/^['"]|['"]$/g, '');
      newData = JSON.parse(cleanNewContent);
    } catch (parseError) {
      throw new Error(`Invalid JSON content to append: ${newContent}`);
    }

    // Convert to arrays if not already arrays
    const currentArray = ensureArray(currentData);
    const newArray = ensureArray(newData);

    // Combine arrays
    const combinedArray = [...currentArray, ...newArray];

    // Write back to file as pretty-printed JSON
    const updatedContent = JSON.stringify(combinedArray, null, 2);
    await fs.writeFile(filePath, updatedContent, 'utf8');

    // Get updated file stats
    const stats = await fs.stat(filePath);

    console.log(`✅ JSON data appended to file: ${cleanFilename}`);
    console.log(`📊 Array length: ${currentArray.length} → ${combinedArray.length}`);

    return {
      success: true,
      message: `JSON data appended to '${cleanFilename}' successfully`,
      filename: cleanFilename,
      newSize: stats.size,
      arrayLength: combinedArray.length,
      path: filePath
    };
  } catch (error) {
    console.error(`❌ Error appending JSON to file '${cleanFilename}':`, error.message);
    throw error;
  }
};

/**
 * Delete a file
 * @param {string} filename - Name of the file to delete
 * @returns {Promise<Object>} - Success message
 */
const deleteFile = async (filename) => {
  try {
    // Validate input
    if (!filename) {
      throw new Error('Filename is required');
    }

    const cleanFilename = path.basename(filename);
    const filePath = path.join(FILES_DIR, cleanFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File '${cleanFilename}' not found`);
      }
      throw error;
    }

    // Delete file using fs.promises.unlink()
    // This permanently removes the file from the filesystem
    await fs.unlink(filePath);

    console.log(`✅ File deleted: ${cleanFilename}`);

    return {
      success: true,
      message: `File '${cleanFilename}' deleted successfully`,
      filename: cleanFilename,
      path: filePath
    };
  } catch (error) {
    console.error(`❌ Error deleting file '${filename}':`, error.message);
    throw error;
  }
};

/**
 * List all files in the directory
 * @returns {Promise<Object>} - List of files with metadata
 */
const listFiles = async () => {
  try {
    // Read directory contents using fs.promises.readdir()
    const files = await fs.readdir(FILES_DIR);

    // Get detailed stats for each file
    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(FILES_DIR, filename);
        const stats = await fs.stat(filePath);

        return {
          filename: filename,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          path: filePath
        };
      })
    );

    console.log(`✅ Listed ${files.length} files`);

    return {
      success: true,
      count: files.length,
      files: fileDetails
    };
  } catch (error) {
    console.error(`❌ Error listing files:`, error.message);
    throw error;
  }
};

module.exports = {
  createFile,
  readFile,
  appendToFile,
  deleteFile,
  listFiles,
  FILES_DIR
};
