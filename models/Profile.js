// Profile Model
// Different pieces of information associated with
// a user on the DevConnector platform
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, // Associates user by ID
    ref: 'users' // Reference the users table in the DB
  }, 
  handle: {
    type: String,
    required: true,
    max: 40 // Max of 40 Characters 
  },
  company: {
    type: String
  },
  website: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  skills: {
    type: [String], // Array of strings - can be updated
    required: true
  },
  bio: {
    type: String
  },
  githubusername: {
    type: String
  },
  // Array Properties
  // User should have multiple experiences that deal with development
  // Array of Objects
  experience: [
    {
      title: { // Title of Position / Experience
        type:String,
        required: true
      },
      company: { // Company
        type: String,
        required: true
      },
      location: { // Where the job took place
        type: String
      },
      from: { // Start and End Dates
        type: Date,
        required: true
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  education: [{
    school: { 
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true
    },
    fieldofstudy: {
      type: String,
      required: true
    },
    from: { // Start and End Dates
      type: Date,
      required: true
    },
    to: {
      type: Date,
    },
    current: {
      type: Boolean,
      default: false
    },
    description: {
      type: String
    }
  }],
  social: {
    youtube: {
      type: String
    }, 
    twitter: {
      type: String
    }, 
    facebook: {
      type: String
    }, 
    linkedin: {
      type: String
    }, 
    instagram: {
      type: String
    },
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
