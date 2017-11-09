// app imports
const { User, Story } = require('../models');
const { APIError, formatResponse, ensureCorrectUser } = require('../helpers');

function addUserFavorite(request, response, next) {
  const { username, storyId } = request.params;
  const correctUser = ensureCorrectUser(
    request.headers.authorization,
    username
  );
  if (correctUser instanceof APIError) {
    return next(correctUser);
  }
  return User.readUser(username)
    .then(() => Story.readStory(storyId))
    .then(() => User.addOrDeleteFavorite(username, storyId, 'add'))
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

function deleteUserFavorite(request, response, next) {
  const { username, storyId } = request.params;
  const correctUser = ensureCorrectUser(
    request.headers.authorization,
    username
  );
  if (correctUser instanceof APIError) {
    return next(correctUser);
  }
  return User.readUser(username)
    .then(() => Story.readStory(storyId))
    .then(() => User.addOrDeleteFavorite(username, storyId, 'delete'))
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

module.exports = {
  addUserFavorite,
  deleteUserFavorite
};
