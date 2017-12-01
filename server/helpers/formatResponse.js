/**
 * Simple helper function to wrap responses in a 'data' object
 * @param {Object} json the JSON object to wrap
 */
function formatResponse(json) {
  delete json.password;  // if there is a password, delete it from response
  return { data: json };
}

module.exports = formatResponse;