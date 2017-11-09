// npm packages
const { Validator } = require('jsonschema');

// app imports
const { User } = require('../models');
const { APIError, formatResponse, validateSchema } = require('../helpers');
const { userNewSchema, loginSchema } = require('../schemas');

// global constants
const v = new Validator();

function login(request, response, next) {
  const validationErrors = validateSchema(
    v.validate(request.body, loginSchema),
    'user'
  );
  if (validationErrors instanceof APIError) {
    return next(validationErrors);
  }
}

function signup(request, response, next) {
  const validationErrors = validateSchema(
    v.validate(request.body, userNewSchema),
    'user'
  );
  if (validationErrors instanceof APIError) {
    return next(validationErrors);
  }
  return User.createUser(new User(request.body.data))
    .then(user => {
      delete user.password;
      user.stories = [];
      return response.status(201).json(formatResponse(user));
    })
    .catch(err => next(err));
}

module.exports = {
  login,
  signup
};
