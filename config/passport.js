// Passport Strategy
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users'); // From user model defined in models dir
const keys = require('../config/keys');

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = keys.secretOrKey;

// Passport is passed in as a parameter from server.js
module.exports = passport => {
  passport.use(new JwtStrategy(options, (jwt_payload, done) => {
    // Payload should include user info from what we included in users.js
    User.findById(jwt_payload.id)
      .then(user => {
        if (user) {
          // If our JWT id matches a logged in user, successful authenticate
          // done takes an error and the user to be returned as arguements 
          return done(null, user);
        } else {
          return done(null, false); // No user
        }
      }).catch(error => console.log(error));
  }));
};