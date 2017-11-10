// npm packages
const jwt = require('jsonwebtoken');

// app imports
const { APIError } = require('../helpers');

function ensureCorrectUser(authHeader, correctUser) {
  let username;
  const token = authHeader.split(' ')[1];
  try {
    username = jwt.decode(token, { json: true }).username;
  } catch (e) {
    return e;
  }
  if (username !== correctUser) {
    return new APIError(
      401,
      'Unauthorized',
      'You are not authorized to make changes to this resource because permissions belong to another user.'
    );
  }
  return 'OK';
}

module.exports = ensureCorrectUser;
