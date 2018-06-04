// Routes for Users, Authentication, Login, Etc.
const express = require('express');
const router = express.Router();

// Test Route 
router.get('/test', (request, response) => {
  response.json({
    msg: 'Users Works'
  });
});

module.exports = router;