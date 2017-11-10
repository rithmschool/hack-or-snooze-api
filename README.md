# Hack or Snooze API

## Live URL

This API is currently running here: [https://hack-or-snooze.herokuapp.com/](https://hack-or-snooze.herokuapp.com/)

## Documentation

Full interactive API documentation available here: [https://hackorsnoozeapi.docs.apiary.io](https://hackorsnoozeapi.docs.apiary.io)

## Development 

### Prerequisites to Running Locally

1. Install Node
1. Install MongoDB
1. (For Testing) Install Dredd `npm i dredd -g`

### How to Run Locally

1. `npm i`
1. In a new tab, `mongod`
1. In the first tab, `npm run dev`

Server runs on http://localhost:5000 by default.

You can also pass any environment variables in a `.env` file.

### How to Run Tests

[Dredd](http://dredd.org/en/latest/index.html) tests run by reading the documentation blueprint against a running server. It must be installed globally to run tests.

```bash
npm i -g dredd
```

After starting the database and server, run the commmand:

```bash
dredd documentation.apib http://localhost:5000 -f ./tests/api-hooks.js
```
