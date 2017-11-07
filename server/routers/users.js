// npm packages
const express = require('express');

// app imports
const { userHandler } = require('../handlers');

// global constants
const router = new express.Router();
const { login, signup } = userHandler;

router
  .route('/login')
  .post(login);

router
  .route('/signup')
  .post(signup);

module.exports = router;
