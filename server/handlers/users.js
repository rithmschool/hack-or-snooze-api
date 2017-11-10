// app imports
const { User, Story } = require('../models');
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
    const finalUsers = await Promise.all(
      users.map(async user => {
        const stories = await Story.readStories(
          { username: user.username },
          { username: 0 }
        );
        const favorites = await Story.readStories(
          {
            storyId: { $in: user.favorites }
          },
          { username: 0 }
        );
        return {
          ...user,
          stories,
          favorites
        };
      })
    );
    return response.json(formatResponse(finalUsers));
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  readUsers
};
