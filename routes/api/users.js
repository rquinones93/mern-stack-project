// Routes for Users, Authentication, Login, Etc.
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../../models/Users');

// @route GET api/users/test
// @desc Tests users route
// @ access Public
router.get('/test', (request, response) => {
  response.json({
    msg: 'Users Works'
  });
});

// @route GET api/users/register
// @desc Register a user
// @ access Public
router.post('/register', (request, response) => {
  // Use Mongoose to find if the email exists
  // Find one is a Mongoose Method
  User.findOne({
      email: request.body.email
    })
    .then(user => {
      // User with this email address exists within DB
      if (user) {
        return response.status(400).json({
          email: 'Email already exists.'
        });

      } else { // Email doesn't exist, create new
        // Set user variables
        const {
          name,
          email,
          password
        } = request.body;

        // Configure gravatar
        const avatar = gravatar.url(email, {
          s: 200, // Size
          r: 'pg', // Rating
          d: 'mm' // Default
        });

        const newUser = new User({
          name: name,
          email: email,
          avatar: avatar,
          password: password
        });

        // Encrypt newUser password
        bcrypt.genSalt(10, (error, salt) => {
          bcrypt.hash(newUser.password, salt, (error, hash) => {
            if (error) throw error;
            newUser.password = hash;

            // Add new user to DB, respond with JSON on success or
            // console log if error
            newUser.save()
              .then(user => response.json(user))
              .catch(error => console.log(error));
          });
        });
      }
    });
});

// @route GET api/users/login
// @desc Login user / Return JWT
// @ access Public
router.post('/login', (request, response) => {
  const {
    email,
    password
  } = request.body;

  // Find user by email
  User.findOne({
      email
    })
    .then(user => {
      // Check for user
      if (!user) {
        return response.status(404).json({
          email: 'User not found'
        });

      } else {
        // Check Password
        bcrypt.compare(password, user.password)
          .then(isMatch => {
            if (isMatch) {
              return response.json({
                msg: 'Success'
              });
            } else {
              return response.status(400).json({
                password: 'Password incorrect'
              });
            }
          })
      }
    });
});

module.exports = router;