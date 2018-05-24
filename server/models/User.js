// npm packages
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

// app imports
const { APIError, processDBError } = require('../helpers');

// constants
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
    name: String,
    password: String,
    stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
    username: {
      type: String,
      index: true
    }
  },
  { timestamps: true }
);

/**
 * A wrapper around bcrypt password hashing
 * @param {function} next callback to next Mongoose middleware
 */
async function _hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const hashed = await bcrypt.hash(this.password, SALT_WORK_FACTOR);
    this.password = hashed;
    return next();
  } catch (err) {
    return next(err);
  }
}

const bound_hashPassword = _hashPassword.bind(userSchema);

userSchema.pre('save', bound_hashPassword);
userSchema.pre('findOneAndUpdate', bound_hashPassword);

userSchema.statics = {
  /**
   * Create a single new User
   * @param {object} newUser - an instance of User
   * @returns {Promise<User, APIError>}
   */
  createUser(newUser) {
    return this.findOne({ username: newUser.username })
      .exec()
      .then(user => {
        if (user) {
          throw new APIError(
            409,
            'User Already Exists',
            `There is already a user with username '${user.username}'.`
          );
        }
      })
      .then(() => newUser.save())
      .then(user => user.toObject())
      .catch(error => Promise.reject(processDBError(error)));
  },
  /**
   * Delete a single User
   * @param {String} username
   * @returns {Promise<Success Message, APIError>}
   */
  deleteUser(username) {
    return this.findOneAndRemove({ username })
      .exec()
      .then(user => {
        if (!user) {
          throw new APIError(
            404,
            'User Not Found',
            `No user '${username}' found.`
          );
        }
        return {
          status: 200,
          title: 'User Deleted',
          message: `User '${username}' successfully deleted.`
        };
      })
      .catch(error => Promise.reject(processDBError(error)));
  },
  /**
   * Get a single User by username
   * @param {String} username
   * @returns {Promise<User, APIError>}
   */
  readUser(username) {
    return this.findOne({ username })
      .populate('favorites')
      .populate('stories')
      .exec()
      .then(user => {
        if (!user) {
          throw new APIError(
            404,
            'User Not Found',
            `No user '${username}' found.`
          );
        }
        return user.toObject();
      })
      .catch(error => Promise.reject(processDBError(error)));
  },
  /**
   * Get a list of Users
   * @param {Object} query - pre-formatted query to retrieve things.
   * @param {Object} fields - a list of fields to select or not in object form
   * @param {String} skip - number of docs to skip (for pagination)
   * @param {String} limit - number of docs to limit by (for pagination)
   * @returns {Promise<Users, APIError>}
   */
  readUsers(query, fields, skip, limit) {
    return this.find(query, fields)
      .skip(skip)
      .limit(limit)
      .sort({ username: 1 })
      .populate('favorites')
      .populate('stories')
      .exec()
      .then(users => {
        if (users.length === 0) {
          return [];
        }
        return users.map(user => user.toObject()); // proper formatting
      })
      .catch(error => Promise.reject(processDBError(error)));
  },
  /**
   * Patch/Update a single User
   * @param {String} username - the User's name
   * @param {Object} userUpdate - the json containing the User attributes
   * @returns {Promise<User, APIError>}
   */
  updateUser(username, userUpdate) {
    return this.findOneAndUpdate({ username }, userUpdate, { new: true })
      .populate('favorites')
      .populate('stories')
      .exec()
      .then(user => {
        if (!user) {
          throw new APIError(
            404,
            'User Not Found',
            `No user with username '${username}' found.`
          );
        }
        return user.toObject();
      })
      .catch(error => Promise.reject(processDBError(error)));
  },

  /**
   * A function to add or remove favorites from the set of
   *  user favorites. Note: favorites are story._ids, not storyIds.
   * @param {String} username
   * @param {String} favoriteId aka story._id
   * @param {String} action 'add' or 'delete'
   * @return {Promise<User>}
   */
  addOrDeleteFavorite(username, favoriteId, action) {
    const actions = {
      add: '$addToSet',
      delete: '$pull'
    };
    return this.findOneAndUpdate(
      { username },
      { [actions[action]]: { favorites: favoriteId } },
      { new: true }
    )
      .populate('favorites')
      .populate('stories')
      .exec()
      .then(user => {
        if (!user) {
          throw new APIError(
            404,
            'User Not Found',
            `No user with username '${username}' found.`
          );
        }
        return user.toObject();
      })
      .catch(error => Promise.reject(processDBError(error)));
  },
  /**
   * This method is for the special instance where a story gets deleted
   *  and it has to be removed from every User's favorite list
   * @param {String} favoriteId aka story._id
   */
  removeFavoriteFromAll(favoriteId) {
    return this.update({}, { $pull: { favorites: favoriteId } });
  }
};

// This code removes _id and __v from query results
if (!userSchema.options.toObject) userSchema.options.toObject = {};
userSchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

module.exports = mongoose.model('User', userSchema);
