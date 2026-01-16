const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { lowercase, number } = require("zod");
const { type } = require("os");

// USER SCHEMA
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email!"],
    lowercase: true,
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
      validator: function (currentField) {
        return this.password === currentField; // return true or false
      },
      message: "password are not same!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  resetPasswordLinkLastSentAt: Date,
  passwordResetWindowStart: Date,
  resetPasswordLinkLastSentCount: {
    type: Number,
    default: 0,
  },
  emailVerificationCode: String,
  emailVerificationExpires: Date,
  emailVerificationLastSentAt: Date,
  emailVerificationWindowStart: Date,
  emailVerificationSentCount: {
    type: Number,
    default: 0,
  },
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
  hasCompletedOnboarding: {
    type: Boolean,
  },
});

// PRE MIDDLEWARE only work in create() and save()
// userSchema.pre('save', async function(next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirm = undefined;
//   next();
// });

userSchema.pre("save", async function () {
  // check if passowrd is not modified. (this="current document object")
  if (!this.isModified("password")) return;

  //hashing the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //deleting "passwordConfirm" field
  this.passwordConfirm = undefined;
});

userSchema.pre("save", function () {
  if (!this.isModified("password") || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});

// EVERYTIME A USER SAVED UPDATE THE TIME
userSchema.pre('save', function() {
  this.updatedAt = Date.now();
})

userSchema.methods.checkPassword = async function (
  plainPassword,
  cipherPassword
) {
  return await bcrypt.compare(plainPassword, cipherPassword);
};

userSchema.methods.isPasswordChangedAfterTokenIssued = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < passwordChangedTime;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.createEmailVerificationCode = function () {
  const verificationCode = crypto.randomInt(1000, 10000).toString();
  this.emailVerificationCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
  return verificationCode;
};

// User collection
const UserModel = mongoose.model("User", userSchema);

// EXPORT
module.exports = UserModel;
