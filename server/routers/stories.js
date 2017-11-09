// npm packages
const express = require('express');

// app imports
const { authRequired, storyHandler, storiesHandler } = require('../handlers');

// global constants
const router = new express.Router();
const { createStory, readStory, updateStory, deleteStory } = storyHandler;
const { readStories } = storiesHandler;

router
  .route('')
  .get(readStories)
  .post(authRequired, createStory);

router
  .route('/:storyId')
  .get(readStory)
  .patch(authRequired, updateStory)
  .delete(authRequired, deleteStory);

module.exports = router;
