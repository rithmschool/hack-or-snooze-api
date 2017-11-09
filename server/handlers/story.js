// npm packages
const { Validator } = require('jsonschema');

// app imports
const { User, Story } = require('../models');
const {
  APIError,
  ensureCorrectUser,
  formatResponse,
  validateSchema
} = require('../helpers');
const { storyNewSchema, storyUpdateSchema } = require('../schemas');

// global constants
const v = new Validator();

function createStory(request, response, next) {
  const validationErrors = validateSchema(
    v.validate(request.body, storyNewSchema),
    'story'
  );
  if (validationErrors instanceof APIError) {
    return next(validationErrors);
  }
  return User.readUser(request.body.data.username)
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
  const { storyId } = request.params.storyId;
  const validationErrors = validateSchema(
    v.validate(request.body, storyUpdateSchema),
    'story'
  );
  if (validationErrors instanceof APIError) {
    return next(validationErrors);
  }
  return Story.readStory(storyId)
    .then(story => {
      const correctUser = ensureCorrectUser(
        request.headers.authorization,
        story.username
      );
      if (correctUser instanceof APIError) {
        return next(correctUser);
      }
    })
    .then(() => Story.updateStory(storyId, request.body.data))
    .then(story => response.json(formatResponse(story)))
    .catch(err => next(err));
}

function deleteStory(request, response, next) {
  const { storyId } = request.params.storyId;
  return Story.readStory(storyId)
    .then(story => {
      const correctUser = ensureCorrectUser(
        request.headers.authorization,
        story.username
      );
      if (correctUser instanceof APIError) {
        return next(correctUser);
      }
    })
    .then(() => Story.deleteStory(storyId))
    .then(story => response.json(formatResponse(story)))
    .catch(err => next(err));
}

module.exports = { createStory, readStory, updateStory, deleteStory };
