const { env } = require("../config/env");
const jwt = require('jsonwebtoken');

// JWT TOKEN
const signToken = (id) => {
    return jwt.sign({ id }, env.SECRET_KEY, {
      expiresIn: env.EXPIRES_IN,
    });
  };

module.exports = { signToken };