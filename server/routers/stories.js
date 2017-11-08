// npm packages
const express = require('express');

// app imports
const { storyHandler, storiesHandler } = require('../handlers');

// global constants
const router = new express.Router();
const { createStory, readStory, updateStory, deleteStory } = storyHandler;
const { readStories } = storiesHandler;

router
  .route('')
  .get(readStories)
  .post(createStory);

router
  .route('/:storyId')
  .get(readStory)
  .patch(updateStory)
  .delete(deleteStory);

module.exports = router;
