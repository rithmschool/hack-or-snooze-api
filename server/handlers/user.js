// npm packages
const { Validator } = require('jsonschema');

// app imports
const { User, Story } = require('../models');
const {
  ensureCorrectUser,
  formatResponse,
  validateSchema
} = require('../helpers');
const { userNewSchema, userUpdateSchema } = require('../schemas');

// global constants
const v = new Validator();

function readUser(request, response, next) {
  const username = request.params.username;
  return User.readUser(username)
    .then(user => {
      // application-level join to include stories and favorites under User
      return Promise.all([
        Story.readStories({ username: username }),
        Story.readStories({ storyId: { $in: user.favorites } })
      ]).then(stories => {
        user.stories = stories[0];
        user.favorites = stories[1];
        delete user.password;
        return response.json(formatResponse(user));
      });
    })
    .catch(err => next(err));
}

function updateUser(request, response, next) {
  const { username } = request.params;
  const correctUser = ensureCorrectUser(
    request.headers.authorization,
    username
  );
  if (correctUser !== 'OK') {
    return next(correctUser);
  }
  const validSchema = validateSchema(
    v.validate(request.body, userUpdateSchema),
    'user'
  );
  if (validSchema !== 'OK') {
    return next(validSchema);
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
  const username = request.params.username;
  const correctUser = ensureCorrectUser(
    request.headers.authorization,
    username
  );
  if (correctUser !== 'OK') {
    return next(correctUser);
  }
  return User.deleteUser(username)
    .then(user => response.json(formatResponse(user)))
    .catch(err => next(err));
}

function createUser(request, response, next) {
  const validSchema = validateSchema(
    v.validate(request.body, userNewSchema),
    'user'
  );
  if (validSchema !== 'OK') {
    return next(validSchema);
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
  createUser,
  readUser,
  updateUser,
  deleteUser
};
