// npm packages
const { Validator } = require('jsonschema');

// app imports
const { User } = require('../models');
const { APIError, formatResponse, validateSchema } = require('../helpers');
const { userNew } = require('../schemas');

// global constants
const v = new Validator();

function login(request, response, next) {
  return User.readUser();
}

function signup(request, response, next) {
  const validationErrors = validateSchema(
    v.validate(request.body, userNew),
    'user'
  );
  if (validationErrors instanceof APIError) {
    return next(validationErrors);
  }
  return User.createUser(new User(request.body.data))
    .then(user => response.status(201).json(formatResponse(user)))
    .catch(err => next(err));
}

module.exports = {
  login,
  signup
};
