// Helps create and update the User's Profile
const express = require('express');
const router = express.Router();

router.get('/test', (request, response) => {
  response.json({
    msg: 'Profile Works'
  });
});

module.exports = router;