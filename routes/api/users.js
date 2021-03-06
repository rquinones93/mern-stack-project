// Routes for Users, Authentication, Login, Etc.
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');


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
  const {
    errors,
    isValid
  } = validateRegisterInput(request.body);

  // Check Validation
  if (!isValid) {
    return response.status(400).json(errors);
  }

  // Use Mongoose to find if the email exists
  // Find one is a Mongoose Method
  User.findOne({
      email: request.body.email
    })
    .then(user => {
      // User with this email address exists within DB
      if (user) {
        errors.email = 'Email already exists';
        return response.status(400).json(errors);

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
    errors,
    isValid
  } = validateLoginInput(request.body);

  // Check Validation
  if (!isValid) {
    return response.status(400).json(errors);
  }

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
        errors.email = 'User not found';
        return response.status(404).json(errors);

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
                keys.secretOrKey, {
                  expiresIn: 3600
                },
                (error, token) => {
                  if (error) throw error;

                  response.json({
                    success: true,
                    token: 'Bearer ' + token // Sends a Bearer Token on Successful Login
                  });
                });

            } else {
              errors.password = 'Password incorrect';
              return response.status(400).json(errors);
            }
          });
      }
    });
});

// @route GET api/users/current
// @desc Return the user that the token belongs to
// @ access Private
// 'jwt' is for the JWT Strategy we're using for authentication
// The authentication method will be able to take the Bearer token passed
// via the HTTP request, and will be able to cross check for a valid JWT
router.get('/current', passport.authenticate('jwt', {
  session: false
}), (request, response) => {
  response.json(request.user);
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