// Routes for Users, Authentication, Login, Etc.
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

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
              // User Matched

              // Sign JWT Token
              // Takes a payload - user info that's decoded when sent to the server.
              const payload = {
                id: user.id,
                name: user.name,
                avatar: user.avatar
              };

              // Takes payload, secret / key, expiration timer, callback function
              jwt.sign(
                payload, 
                keys.secretOrKey, 
                { expiresIn: 3600 }, 
                (err, token) => {
                  response.json({
                    success: true,
                    token: 'Bearer' + token // Sends a Bearer Token on Successful Login
                  });
              });

            } else {
              return response.status(400).json({
                password: 'Password incorrect'
              });
            }
          });
      }
    });
});

module.exports = router;

/*
  What is a JSON Web Token?
  - A JWT is an open standard that defines a compact and self-contained
    way for securely transmitting information between parties as JSON.

  - This information can be verified and trusted because it is digitally
    signed.

  - Signed upsing a secret with a HMAC Algorithm, or a public/private RSA
    or ECDSA key

  What is a Bearer Token?
  - The predominant type of access token used with OAuth 2.0
*/