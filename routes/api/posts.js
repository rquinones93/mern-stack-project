// Routes for User Posts
const express = require('express');
const router = express.Router();

// Test Route 
router.get('/test', (request, response) => {
  response.json({
    msg: 'Posts Works'
  });
});

module.exports = router;