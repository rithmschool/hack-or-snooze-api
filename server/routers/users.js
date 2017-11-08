// npm packages
const express = require('express');

// app imports
const { userHandler, usersHandler, favoritesHandler } = require('../handlers');

// global constants
const router = new express.Router();
const { readUser, updateUser, deleteUser } = userHandler;
const { readUsers } = usersHandler;
const { addUserFavorite, deleteUserFavorite } = favoritesHandler;
router.route('').get(readUsers);

router
  .route('/:username')
  .get(readUser)
  .patch(updateUser)
  .delete(deleteUser);

router
  .route('/:username/favorites/:storyId')
  .post(addUserFavorite)
  .delete(deleteUserFavorite);

module.exports = router;
