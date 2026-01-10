const mongoose = require("mongoose");
const validator = require("validator");

// USER SCHEMA
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email!"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email id!"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide your Password!"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      // this method only work for create() and save() method ONLY!
      validator: function (passwordConfirm) {
        return this.password === passwordConfirm; // return true or false
      },
      message: "password are not same!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  digestFrequency: {
    type: String,
    enum: ["daily", "monthly", "weekly"],
    default: "daily",
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
    select: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  updatedAt: {
    type: Date,
    select: false,
  },
  deletedAt: {
    type: Date,
    select: false,
  },
});

// User collection
const UserModel = mongoose.model('User', userSchema);

// EXPORT
module.exports = UserModel;