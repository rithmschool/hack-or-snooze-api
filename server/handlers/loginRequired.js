// npm packages
const config = require('config');
const jwt = require('jsonwebtoken');

// app imports
const { APIError } = require('../helpers');

// global constants
const SECRET_KEY = config.get('jwt').secretKey;

function loginRequired(request, response, next) {
  try {
    const token = request.headers.authorization.split(' ')[1];
    jwt.verify(token, SECRET_KEY);
    return next();
  } catch (e) {
    return next(
      new APIError(401, 'Unauthorized', 'You must be logged in to continue.')
    );
  }
}

module.exports = loginRequired;
