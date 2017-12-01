// app imports
const { User, Story } = require('../models');
const { formatResponse, ensureCorrectUser } = require('../helpers');

function addUserFavorite(request, response, next) {
  const { username, storyId } = request.params;
  const correctUser = ensureCorrectUser(
    request.headers.authorization,
    username
  );
  if (correctUser !== 'OK') {
    return next(correctUser);
  }
  return User.readUser(username)
    .then(() => Story.getMongoId(storyId))
    .then(story_id => User.addOrDeleteFavorite(username, story_id, 'add'))
    .then(user => response.json(formatResponse(user)))
    .catch(err => next(err));
}

function deleteUserFavorite(request, response, next) {
  const { username, storyId } = request.params;
  const correctUser = ensureCorrectUser(
    request.headers.authorization,
    username
  );
  if (correctUser !== 'OK') {
    return next(correctUser);
  }
  return User.readUser(username)
    .then(() => Story.getMongoId(storyId))
    .then(story_id => User.addOrDeleteFavorite(username, story_id, 'delete'))
    .then(user => response.json(formatResponse(user)))
    .catch(err => next(err));
}

module.exports = {
  addUserFavorite,
  deleteUserFavorite
};
