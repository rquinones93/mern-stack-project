// Routes for User Posts
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post Model
const Post = require('../../models/Post');

// Post Input Validation
const validatePostInput = require('../../validation/post');

// Profile Model
const Profile = require('../../models/Profile');

// Test Route 
router.get('/test', (request, response) => {
  response.json({
    msg: 'Posts Works'
  });
});

//@route  GET api/posts
//@desc   Get posts and sort by newest date
//@access Public
router.get('/', (request, response) => {
  Post.find()
    .sort({date: -1})
    .then(posts => response.json(posts))
    .catch(err => response.status(404));
});

//@route  GET api/posts/:id
//@desc   Get single post by ID
//@access Public
router.get('/:id', (request, response) => {
  Post.findById(request.params.id)
    .then(post => response.json(post))
    .catch(err => response.status(404).json({
      nopostfound: 'No post found with that ID'
    }));
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

//@route  DELETE api/posts/:id
//@desc   Delete post by ID
//@access Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (request, response) => {
  // Get User's Profile, Remove Post by ID from User's Profile
  Profile.findOne( { user: request.user.id })
    .then(profile => {
      Post.findById(request.params.id)
        .then(post => {
          // Check post owner == logged in user
          if ( post.user.toString() !== request.user.id ) {
            // Logged in user is not post owner, unauthorized
            return response.status(401).json({ notauthorized: 'User not authorized'});
          }

          // Delete Post
          post.remove().then(() => response.json({ success: true}));
        })
        .catch(err => response.status(404).json({ postnotfound: 'No post found'}));
    });
});

module.exports = router;