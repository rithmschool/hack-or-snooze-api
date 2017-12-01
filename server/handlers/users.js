// app imports
const { User } = require('../models');
const { formatResponse, parseSkipLimit } = require('../helpers');

async function readUsers(request, response, next) {
  let skip = parseSkipLimit(request.query.skip, null, 'skip') || 0;
  let limit = parseSkipLimit(request.query.limit, 50, 'limit') || 50;
  if (typeof skip !== 'number') {
    return next(skip);
  } else if (typeof limit !== 'number') {
    return next(limit);
  }
  try {
    const users = await User.readUsers({}, { password: 0 }, skip, limit);
    return response.json(formatResponse(users));
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  readUsers
};
