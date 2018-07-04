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

// @route  POST api/profile
// @desc   Create or Edit user profile
// @access Private - use jwt strategy to authenticatte
router.post('/', passport.authenticate('jwt', { session: false }), (request, response) => {
  // Get all the fields needed for a user profile
  const profileFields = {};

  profileFields.user = request.user.id; // Includes avatar, name, email
  
  // Check for other form data
  if (request.body.handle)   profileFields.handle  = request.body.handle;
  if (request.body.company)  profileFields.company = request.body.company;
  if (request.body.website)  profileFields.website = request.body.website;
  if (request.body.location) profileFields.location = request.body.location;
  if (request.body.bio) profileFields.bio = request.body.bio;
  if (request.body.status) profileFields.status = request.body.status;
  if (request.body.githubusername) profileFields.githubusername = request.body.githubusername;

  // Skills - Split into an array
  if (typeof request.body.skills !== 'undefined') {
    profileFields.skills = request.body.skills.split(','); // CSV - Comma Separated Values field
  }

  // Social - in its own object
  profileFields.social = {};
  if (request.body.youtube)   profileFields.social.youtube = request.body.youtube;
  if (request.body.twitter)   profileFields.social.twitter = request.body.twitter;
  if (request.body.facebook)  profileFields.social.facebook = request.body.facebook;
  if (request.body.linkedin)  profileFields.social.linkedin = request.body.linkedin;
  if (request.body.instagram) profileFields.social.instagram = request.body.instagram;

  // Try to find the logged in user
  Profile.findOne({ user: request.user.id })
    .then(profile => {
      if(profile) {
        // Update user profile, then return to front end
        Profile.findOneAndUpdate({ user: request.user.id }, { $set: profileFields }, { new: true})
          .then(profile => response.json(profile));
      } else {
        // Create user profile
        // Check to see if handle exists
        Profile.findOne({ handle: profileFields.handle })
          .then(profile => {
            if(profile) {
              errors.handle = 'That handle already exists';
              response.status(400).json(errors);
            }

            // Save Profile to DB, then sent to front end
            new Profile(profileFields).save()
                .then(profile => response.json(profile));
          });
      }
    });
});

module.exports = router;