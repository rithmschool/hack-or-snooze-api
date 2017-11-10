// app imports
const { Story } = require('../models');
const { formatResponse, parseSkipLimit } = require('../helpers');

function readStories(request, response, next) {
  let skip = parseSkipLimit(request.query.skip, null, 'skip') || 0;
  let limit = parseSkipLimit(request.query.limit, 50, 'limit') || 50;
  if (typeof skip !== 'number') {
    return next(skip);
  } else if (typeof limit !== 'number') {
    return next(limit);
  }
  return Story.readStories({}, {}, skip, limit)
    .then(stories => response.json(formatResponse(stories)))
    .catch(err => next(err));
}
module.exports = { readStories };
