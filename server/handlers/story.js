// npm packages
const { Validator } = require('jsonschema');

// app imports
const { User, Story } = require('../models');
const { APIError, formatResponse, validateSchema } = require('../helpers');
const { storyNew, storyUpdate } = require('../schemas');

// global constants
const v = new Validator();

function createStory(request, response, next) {
  const validationErrors = validateSchema(
    v.validate(request.body, storyNew),
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
  const validationErrors = validateSchema(
    v.validate(request.body, storyUpdate),
    'story'
  );
  if (validationErrors instanceof APIError) {
    return next(validationErrors);
  }
  return Story.updateStory(request.params.storyId, request.body.data)
    .then(story => response.json(formatResponse(story)))
    .catch(err => next(err));
}

function deleteStory(request, response, next) {
  return Story.deleteStory(request.params.storyId)
    .then(story => response.json(formatResponse(story)))
    .catch(err => next(err));
}

module.exports = { createStory, readStory, updateStory, deleteStory };
