// npm packages
const express = require('express');

// app imports
const { userHandler } = require('../handlers');

// global constants
const router = new express.Router();
const {
  login,
  signup,
  readUser,
  updateUser,
  deleteUser,
  addUserFavorite,
  deleteUserFavorite
} = userHandler;

router.route('/login').post(login);

router.route('/signup').post(signup);

router
  .route('/:userId')
  .get(readUser)
  .patch(updateUser)
  .delete(deleteUser);

router.route('/:userId/favorites').post(addUserFavorite);

router.route('/:userId/favorites/:favoriteId').delete(deleteUserFavorite);

module.exports = router;
