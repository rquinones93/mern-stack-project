const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Route Setup
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

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

// Route Usage
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);


// Change port depending on deployment vs local
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});