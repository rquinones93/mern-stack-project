const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema for a new Post Type
const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users' // Reference to users collection
  },
  text: {
    type: String, // Text required for a new post
    required: true
  }, 
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  likes: [ // Can be linked to each user that liked the post - 1 like per user
    { // Array of user objects
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users' // Reference to users collection
      }
    }
  ],
  comments: [ // Below is each piece of data for a valid comment
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users' // Reference to users collection
      },
      text: {
        type: String,
        required: true
      },
      name: {
          type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: { // Date of Post
    type: Date,
    default: Date.now
  }
});

module.exports = Post = mongoose.model('post', PostSchema);