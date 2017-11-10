// npm packages
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
Promise = require('bluebird'); // eslint-disable-line

// app imports
const { ENV, MONGODB_URI } = require('./config');
const { authHandler, errorHandler } = require('./handlers');
const { storiesRouter, usersRouter } = require('./routers');

// global constants
dotenv.config();
const app = express();
const PORT = 5000;
const {
  bodyParserHandler,
  globalErrorHandler,
  fourOhFourHandler,
  fourOhFiveHandler
} = errorHandler;
// database
mongoose.Promise = Promise;
if (ENV === 'development') {
  mongoose.set('debug', true);
}
mongoose.connect(MONGODB_URI, { useMongoClient: true, autoIndex: true });

// body parser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/*' }));
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

app.post('/auth', authHandler);
app.use('/stories', storiesRouter);
app.use('/users', usersRouter);
app.get('*', fourOhFourHandler); // catch-all for 404 "Not Found" errors
app.all('*', fourOhFiveHandler); // catch-all for 405 "Method Not Allowed" errors
app.use(globalErrorHandler);

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(
    `Hack or Snooze API express server is listening on port ${PORT}...`
  );
});
