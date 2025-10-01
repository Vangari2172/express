const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const fsRoutes = require('./routes/fsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
// 1. Security middleware - helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// 2. CORS middleware - allows cross-origin requests (useful for Postman/frontend)
app.use(cors());

// 3. Morgan middleware - logs HTTP requests to console (great for debugging)
app.use(morgan('dev'));

// 4. Body parsing middleware - parses JSON bodies from requests
// This is crucial for receiving data from Postman requests
app.use(express.json({ limit: '10mb' })); // Allows JSON payloads up to 10MB
app.use(express.urlencoded({ extended: true })); // Allows form data

// Routes
// All file system operations will be available under /api/fs
app.use('/api/fs', fsRoutes);

// Health check route - useful to verify server is running
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'File System CRUD Server is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler - catches any routes that don't exist
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`,
    availableRoutes: {
      health: 'GET /health',
      fileOperations: 'All routes under /api/fs/*'
    }
  });
});

// Global error handler - catches any errors thrown in the application
app.use((error, req, res, next) => {
  console.error('Error occurred:', error);

  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 File System CRUD Server is running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 File operations: http://localhost:${PORT}/api/fs`);
  console.log(`\n📖 Available endpoints:`);
  console.log(`   POST   /api/fs/create  - Create a new file`);
  console.log(`   GET    /api/fs/read    - Read a file`);
  console.log(`   PUT    /api/fs/append  - Append to a file`);
  console.log(`   DELETE /api/fs/delete  - Delete a file`);
  console.log(`   GET    /api/fs/list    - List files in directory`);
});

module.exports = app;
