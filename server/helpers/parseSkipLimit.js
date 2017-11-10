const APIError = require('./APIError');
/**
* Validate the 'limit' and `skip` query params
* @param {String} val - limit or skip param
* @param {Number} max - the max value
* @param {String} type - what we're validating (skip or limit)
* @return {Number} numerical form of the thing
*/
function parseSkipLimit(val, max, type) {
  if (!val) {
    return null;
  }
  const min = type === 'skip' ? 0 : 1;
  const num = Number(val);

  if (isNaN(num)) {
    return new APIError(
      400,
      'Bad Request',
      `Invalid ${type}: '${val}', ${type} needs to be an integer.`
    );
  } else if (num < min || (max && num > max)) {
    return new APIError(
      400,
      'Bad Request',
      `${num} is out of range for ${type} -- it should be between ${min} and ${max}.`
    );
  }

  return num;
}

module.exports = parseSkipLimit;
