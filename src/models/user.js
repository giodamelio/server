const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../config');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  photo: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    required: true,
    default: 'user',
  },
  approved: {
    type: Boolean,
    default: false,
  },
});

UserSchema.pre('save', function(next) {
  return bcrypt.hash(this.password, 8, (err, hashedPassword) => {
    /* istanbul ignore if */
    if (err) {
      return next(err);
    }

    this.password = hashedPassword;
    return next();
  });
});

UserSchema.methods.comparePassword = function(password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, data) => {
      /* istanbul ignore if */
      if (err) {
        return reject(err);
      }
      if (data === false) {
        return reject(new Error('Password did not match'));
      }
      return resolve(this);
    });
  });
};

UserSchema.methods.getToken = function() {
  return jwt.sign({
    email: this.email,
    role: this.role,
    _id: this._id,
  }, config.SECRET);
};

module.exports = mongoose.model('User', UserSchema);
