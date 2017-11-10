// npm packages
const { Validator } = require('jsonschema');

// app imports
const { User, Story } = require('../models');
const {
  ensureCorrectUser,
  formatResponse,
  validateSchema
} = require('../helpers');
const { storyNewSchema, storyUpdateSchema } = require('../schemas');

// global constants
const v = new Validator();

function createStory(request, response, next) {
  const validSchema = validateSchema(
    v.validate(request.body, storyNewSchema),
    'story'
  );
  if (validSchema !== 'OK') {
    return next(validSchema);
  }
  const { username } = request.body.data;
  const correctUser = ensureCorrectUser(
    request.headers.authorization,
    username
  );
  if (correctUser !== 'OK') {
    throw correctUser;
  }
  return User.readUser(username)
    .then(() => Story.createStory(new Story(request.body.data)))
    .then(story => response.status(201).json(formatResponse(story)))
    .catch(err => next(err));
}

function readStory(request, response, next) {
  return Story.readStory(request.params.storyId)
    .then(story => response.json(formatResponse(story)))
    .catch(err => next(err));
}

function updateStory(request, response, next) {
  const { storyId } = request.params;
  const validSchema = validateSchema(
    v.validate(request.body, storyUpdateSchema),
    'story'
  );
  if (validSchema !== 'OK') {
    return next(validSchema);
  }
  return Story.readStory(storyId)
    .then(story => {
      const correctUser = ensureCorrectUser(
        request.headers.authorization,
        story.username
      );
      if (correctUser !== 'OK') {
        throw correctUser;
      }
    })
    .then(() => Story.updateStory(storyId, request.body.data))
    .then(story => response.json(formatResponse(story)))
    .catch(err => next(err));
}

function deleteStory(request, response, next) {
  const { storyId } = request.params;
  return Story.readStory(storyId)
    .then(story => {
      const correctUser = ensureCorrectUser(
        request.headers.authorization,
        story.username
      );
      if (correctUser !== 'OK') {
        throw correctUser;
      }
    })
    .then(() => Story.deleteStory(storyId))
    .then(story => response.json(formatResponse(story)))
    .catch(err => next(err));
}

module.exports = { createStory, readStory, updateStory, deleteStory };
