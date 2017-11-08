// app imports
const { Story } = require('../models');
const { formatResponse } = require('../helpers');

function readStories(request, response, next) {
  return Story.readStories()
    .then(stories => response.json(formatResponse(stories)))
    .catch(err => next(err));
}
module.exports = { readStories };
