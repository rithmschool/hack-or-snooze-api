const APIError = require('./APIError');

/**
* Validate the thing POST and PATCH payloads against the appropriate schema definitions.
* @param {Object} validation schema validation object {the return value of v.validate(payload, schemaDefinition)}
* @param {String} type the thing being validated
* @return {APIError} an APIError with a list of validation issues
*/
function validateSchema(validation, type) {
  let errors;

  if (!validation.valid) {
    errors = validation.errors.map(error => {
      if (error.name === 'additionalProperties') {
        return `'${error.argument}' is an invalid ${type} attribute.`;
      }
      return error.stack.replace(/"/g, "'").replace('instance.', '');
    });

    return new APIError(
      400,
      'Bad Request',
      `The following validation errors occurred: ${errors.join(', ')}.`
    );
  }
}

module.exports = validateSchema;
