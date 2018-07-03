const express    = require('express');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');
const passport   = require('passport');

// Route Setup
const users   = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts   = require('./routes/api/posts');

// Initialize Express Application
const app = express();

// Body Parser Middlewhere
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database Configuration
const database = require('./config/keys').mongoURI;

// Connect to mLab MongoDB
mongoose.connect(database)
  .then(() => {
    console.log('MongoDB Connected');

  }).catch(error => console.log(error));

// Passport Middleware 
app.use(passport.initialize());

// Passport Config for JWT Strategy - pass in passport
require('./config/passport')(passport);

// Route Usage
app.use('/api/users',   users);
app.use('/api/profile', profile);
app.use('/api/posts',   posts);


// Change port depending on deployment vs local
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/* 
  Middleware Definition
  - Software that acts as a bridge between an operating system or database
    and applications, especially on a network.

  "An Express application is essentially a series of middleware function calls."
  - Middleware functions are functions that have access to the request and response objects,
    and the "next" middleware function in the application's request-response cycle.
*/