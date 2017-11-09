// npm packages
const bodyParser = require('body-parser');
const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
Promise = require('bluebird'); // eslint-disable-line

// app imports
const { errorHandler, signupLoginHandler, loginRequired } = require('./handlers');
const { stories, users } = require('./routers');

// global constants
const app = express();
const PORT = 5000;
const {
  bodyParserHandler,
  globalErrorHandler,
  fourOhFourHandler,
  fourOhFiveHandler
} = errorHandler;
const { login, signup } = signupLoginHandler;

// database
mongoose.Promise = Promise;
mongoose.set('debug', true);
const { host, name, options } = config.get('dbConfig');
mongoose.connect(`mongodb://${host}/${name}`, options);

// body parser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParserHandler); // error handling specific to body parser only

// response headers setup
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Content-Type');
  response.header('Access-Control-Allow-Methods', 'POST,GET,PATCH,DELETE');
  response.header('Access-Control-Expose-Headers', 'Correlation-Id');
  response.header('Content-Type', 'application/json');
  return next();
});

app.post('/signup', signup);
app.post('/login', login);
app.use('*', loginRequired);
app.use('/stories', stories);
app.use('/users', users);
app.get('*', fourOhFourHandler); // catch-all for 404 "Not Found" errors
app.all('*', fourOhFiveHandler); // catch-all for 405 "Method Not Allowed" errors
app.use(globalErrorHandler);

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(
    `Hack or Snooze API express server is listening on port ${PORT}...`
  );
});
