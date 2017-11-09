// npm packages
const express = require('express');

// app imports
const {
  authRequired,
  userHandler,
  usersHandler,
  favoritesHandler
} = require('../handlers');

// global constants
const router = new express.Router();
const { createUser, readUser, updateUser, deleteUser } = userHandler;
const { readUsers } = usersHandler;
const { addUserFavorite, deleteUserFavorite } = favoritesHandler;

router
  .route('')
  .get(authRequired, readUsers)
  .post(createUser);

router
  .route('/:username')
  .get(authRequired, readUser)
  .patch(authRequired, updateUser)
  .delete(authRequired, deleteUser);

router
  .route('/:username/favorites/:storyId')
  .post(authRequired, addUserFavorite)
  .delete(authRequired, deleteUserFavorite);

module.exports = router;
