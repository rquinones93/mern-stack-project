// Routes for User Posts
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post Model
const Post = require('../../models/Post')

// Post Input Validation
const validatePostInput = require('../../validation/post');

// Test Route 
router.get('/test', (request, response) => {
  response.json({
    msg: 'Posts Works'
  });
});

//@route  POST api/posts
//@desc   Create new post
//@access Private
router.post('/', passport.authenticate('jwt', { session: false} ), (request, response) => {
  const { errors, isValid } = validatePostInput(request.body);

  // Check Validation
  if ( !isValid ) {
    // If any errors, send 400 with errors object
    return response.status(400).json(errors);
  }
  const newPost = new Post({
    text: request.body.text,
    name: request.body.name,
    avatar: request.body.avatar,
    user: request.user.id
  });

  newPost.save().then(post => response.json(post));
});

module.exports = router;