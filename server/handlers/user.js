// npm packages
const { Validator } = require('jsonschema');

// app imports
const { User, Story } = require('../models');
const { APIError, formatResponse, validateSchema } = require('../helpers');
const { userNew, userUpdate } = require('../schemas');

// global constants
const v = new Validator();

function readUser(request, response, next) {
  return User.readUser(request.params.username)
    .then(user => response.json(formatResponse(user)))
    .catch(err => next(err));
}

function updateUser(request, response, next) {
  const validationErrors = validateSchema(
    v.validate(request.body, userUpdate),
    'user'
  );
  if (validationErrors instanceof APIError) {
    return next(validationErrors);
  }
  if (request.body.data.username) {
    return next(
      new APIError(
        400,
        'Bad Request',
        'Username is immutable. Do not include username in the PATCH body.'
      )
    );
  }
  return User.updateUser(request.params.username, request.body.data)
    .then(user => response.json(formatResponse(user)))
    .catch(err => next(err));
}
function deleteUser(request, response, next) {
  return User.deleteUser(request.params.username)
    .then(user => response.json(formatResponse(user)))
    .catch(err => next(err));
}
function addUserFavorite(request, response, next) {}
function deleteUserFavorite(request, response, next) {}

module.exports = {
  readUser,
  updateUser,
  deleteUser,
  addUserFavorite,
  deleteUserFavorite
};
