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

//@route  POST api/posts/like/:id
//@desc   Like a post
//@access Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (request, response) => {
  // Get User's Profile, Remove Post by ID from User's Profile
  Profile.findOne({ user: request.user.id })
    .then(profile => {
      Post.findById(request.params.id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() === request.user.id ).length > 0 ) {
            return response.status(400).json({ alreadyliked: 'User already liked this post'});
          }

          // Add user id to likes array
          post.likes.unshift({ user: request.user.id });

          // Save to DB
          post.save().then( post => response.json(post) );

        })
        .catch(err => response.status(404).json({
          postnotfound: 'No post found'
        }));
    });
});

//@route  POST api/posts/unlike/:id
//@desc   Unlike a post
//@access Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (request, response) => {
  // Get User's Profile, Remove Post by ID from User's Profile
  Profile.findOne({ user: request.user.id })
    .then(profile => {
      Post.findById(request.params.id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() === request.user.id).length === 0) {
            return response.status(400).json({
              notliked: 'You have not yet liked this post'
            });
          }

          // Get remove index
          const removeIndex = post.likes.map( item => item.user.toString ).indexOf(request.user.id);

          // Splice remove index out of the array
          post.likes.splice(removeIndex, 1);

          // Save to DB
          post.save().then(post => response.json(post));
        })
        .catch(err => response.status(404).json({
          postnotfound: 'No post found'
        }));
    });
});

//@route  POST api/posts/comment/:id
//@desc   Add comment to post by id
//@access Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false}), (request, response) => {
  const { errors, isValid } = validatePostInput(request.body);

  // Check Validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return response.status(400).json(errors);
  }

  Post.findById(request.params.id)
    .then(post => {
      const newComment = {
        text: request.body.text,
        name: request.body.name,
        avatar: request.body.avatar,
        user: request.user.id
      };

      // Add to comments array
      post.comments.unshift( newComment );

      // Save to DB
      post.save().then( post => response.json(post));
    })
    .catch(err => response.status(404).json( { postnotfound: 'No post found'}));
});

//@route  DELETE api/posts/comment/:id/:comment_id
//@desc   Delete comment from post id and comment_id
//@access Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (request, response) => {

  Post.findById(request.params.id)
    .then(post => {
      // Check to see if comment exists

      // Comment doesn't exist
      if ( post.comments.filter( comment => comment._id.toString() === request.params.comment_id ).length === 0 ) {
        return response.status(404).json({ commentnotexist: 'Comment does not exist'});
      }

      // Comment Exists, Remove it
      const removeIndex = post.comments.map( item => item._id.toString()).indexOf( request.params.comment_id );
      post.comments.splice(removeIndex, 1 );

      // Save updated post to DB
      post.save().then(post => response.json(post));
    })
    .catch(err => response.status(404).json({
      postnotfound: 'No post found'
    }));
});

module.exports = router;