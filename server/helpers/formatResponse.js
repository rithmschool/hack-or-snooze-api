/**
 * Simple helper function to wrap responses in a 'data' object
 * @param {Object} json the JSON object to wrap
 */
function formatResponse(json) {
  return { data: json };
}

module.exports = formatResponse;