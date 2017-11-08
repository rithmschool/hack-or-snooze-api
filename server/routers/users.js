// npm packages
const express = require('express');

// app imports
const { userHandler } = require('../handlers');

// global constants
const router = new express.Router();
const {
  readUser,
  updateUser,
  deleteUser,
  addUserFavorite,
  deleteUserFavorite
} = userHandler;

router
  .route('/:username')
  .get(readUser)
  .patch(updateUser)
  .delete(deleteUser);

router.route('/:username/favorites').post(addUserFavorite);

router.route('/:username/favorites/:favoriteId').delete(deleteUserFavorite);

module.exports = router;
