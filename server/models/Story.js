// npm packages
const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

// app imports
const { APIError, processDBError } = require('../helpers');

// constants
const Schema = mongoose.Schema;

const storySchema = new Schema(
  {
    author: String,
    storyId: {
      type: String,
      index: true
    },
    title: String,
    url: String,
    username: {
      type: String,
      index: true
    }
  },
  { timestamps: true }
);

storySchema.statics = {
  /**
   * Create a single new Story
   * @param {object} newStory - an instance of Story
   * @returns {Promise<Story, APIError>}
   */
  createStory(newStory) {
    newStory.storyId = uuidv4();
    return newStory
      .save()
      .then(story => story.toObject())
      .catch(error => Promise.reject(processDBError(error)));
  },
  /**
   * Delete a single Story
   * @param {String} storyId
   * @returns {Promise<Success Message, APIError>}
   */
  deleteStory(storyId) {
    return this.findOneAndRemove({ storyId })
      .exec()
      .then(story => {
        if (!story) {
          throw new APIError(
            404,
            'Story Not Found',
            `No story with ID '${storyId}' found.`
          );
        }
        return Promise.resolve({
          status: 200,
          title: 'Story Deleted',
          message: `Story with ID '${storyId}' successfully deleted.`
        });
      })
      .catch(error => Promise.reject(processDBError(error)));
  },
  /**
   * Get a single Story by storyId
   * @param {String} storyId
   * @returns {Promise<Story, APIError>}
   */
  readStories(storyId) {
    return this.findOne({ storyId })
      .exec()
      .then(story => {
        if (!story) {
          throw new APIError(
            404,
            'Story Not Found',
            `No story with ID '${storyId}' found.`
          );
        }
        return story.toObject();
      })
      .catch(error => Promise.reject(processDBError(error)));
  },
  /**
   * Get a list of Stories
   * @param {object} query - pre-formatted query to retrieve things.
   * @param {String} skip - number of docs to skip (for pagination)
   * @param {String} limit - number of docs to limit by (for pagination)
   * @returns {Promise<Stories, APIError>}
   */
  readAllStories(query, skip, limit) {
    return this.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 })
      .exec()
      .then(stories => {
        if (stories.length === 0) {
          throw new APIError(
            404,
            'No Stories Found',
            'No stories found matching your query.'
          );
        }
        return stories.map(story => story.toObject()); // proper formatting
      })
      .catch(error => Promise.reject(processDBError(error)));
  },
  /**
   * Patch/Update a single Story
   * @param {String} storyId
   * @param {Object} storyUpdate - the json containing the Story attributes
   * @returns {Promise<Story, APIError>}
   */
  updateStory(storyId, storyUpdate) {
    return this.findOneAndUpdate({ storyId }, storyUpdate, { new: true })
      .exec()
      .then(story => {
        if (!story) {
          throw new APIError(
            404,
            'Story Not Found',
            `No story with ID '${storyId}' found.`
          );
        }
        return story.toObject();
      })
      .catch(error => Promise.reject(processDBError(error)));
  }
};

/* Transform with .toObject to remove __v and _id from response */
if (!storySchema.options.toObject) storySchema.options.toObject = {};
storySchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

module.exports = mongoose.model('Story', storySchema);
