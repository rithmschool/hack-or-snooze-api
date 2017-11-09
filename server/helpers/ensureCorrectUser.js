// npm packages
const jwt = require('jsonwebtoken');

// app imports
const { APIError } = require('../helpers');

function ensureCorrectUser(token, correctUser) {
  let username;
  try {
    username = jwt.decode(token, { json: true }).payload.username;
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
}

module.exports = ensureCorrectUser;
