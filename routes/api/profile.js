// Helps create and update the User's Profile
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Connection to DB
const passport = require('passport'); // Protected routes

// Load Profile Model
const Profile = require('../../models/Profile');

// Load User Profile 
const User = require('../../models/Users');

// @route GET api/profile
// @desc  Get current user's profile
// @access Private - use jwt strategy to authenticatte
router.get('/', passport.authenticate('jwt', {session: false}), (request, response) => {
  const errors = {};

  // Check profile table to find user based on their id
  Profile.findOne({user: request.user.id})
    .then(profile => {
      // No valid user profile related to id
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        return response.status(404).json(errors);
      }

      // Valid user profile related to id
      response.json(profile);
    })
    .catch(error => response.status(404).json(error));
});

module.exports = router;