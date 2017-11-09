// npm packages
const { Validator } = require('jsonschema');

// app imports
const { User, Story } = require('../models');
const { APIError, formatResponse, validateSchema } = require('../helpers');
const { userUpdateSchema } = require('../schemas');

// global constants
const v = new Validator();

function readUser(request, response, next) {
  const username = request.params.username;
  return User.readUser(username)
    .then(user => {
      // application-level join to include stories and favorites under User
      Promise.all([
        Story.readStories({ username: username }),
        Story.readStories({ storyId: { $in: user.favorites } })
      ]).then(stories => {
        user.stories = stories[0];
        user.favorites = stories[1];
        return response.json(formatResponse(user));
      });
    })
    .catch(err => next(err));
}

function updateUser(request, response, next) {
  const { username } = request.params;
  const validationErrors = validateSchema(
    v.validate(request.body, userUpdateSchema),
    'user'
  );
  if (validationErrors instanceof APIError) {
    return next(validationErrors);
  }
  return User.updateUser(username, request.body.data)
    .then(user => {
      // application-level join to include stories and favorites under User
      Promise.all([
        Story.readStories({ username: username }),
        Story.readStories({ storyId: { $in: user.favorites } })
      ]).then(stories => {
        user.stories = stories[0];
        user.favorites = stories[1];
        return response.json(formatResponse(user));
      });
    })
    .catch(err => next(err));
}
function deleteUser(request, response, next) {
  return User.deleteUser(request.params.username)
    .then(user => response.json(formatResponse(user)))
    .catch(err => next(err));
}

module.exports = {
  readUser,
  updateUser,
  deleteUser
};
