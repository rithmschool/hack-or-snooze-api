const { before, beforeEach, after } = require('hooks');
const axios = require('axios');
const faker = require('faker');

/* eslint-disable no-console */

const testUsername1 = `test${faker.internet.domainWord()}`;
const testUser1 = {
  data: {
    name: `Test ${faker.name.findName()}`,
    username: testUsername1,
    password: 'foo123'
  }
};

const testUsername2 = `test${faker.internet.domainWord()}`;
const testUser2 = {
  data: {
    name: `Test ${faker.name.findName()}`,
    username: testUsername2,
    password: 'foo123'
  }
};

const testStory1 = {
  data: {
    author: `Test ${faker.name.findName()}`,
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()} ${faker.hacker.verb()}`,
    url: faker.internet.url(),
    username: testUsername1
  }
};
let testStory1Id;
const testStory2 = {
  data: {
    author: `Test ${faker.name.findName()}`,
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()} ${faker.hacker.verb()}`,
    url: faker.internet.url(),
    username: testUsername1
  }
};
let testStory2Id;

const badRequest = {
  foo: 'bar'
};
const fourOhFour = 'asdfasdfsaf';
let fourOhFourToken;

let token1;
let authHeader1;
let token2;
let authHeader2;

beforeEach((transaction, done) => {
  transaction.request.headers['Content-Type'] = 'application/json';
  return done();
});

before(
  'Auth > Authorize to Receive a Token > Example 1',
  (transaction, done) => {
    const { protocol, host, port } = transaction;
    axios.defaults.baseURL = `${protocol}//${host}:${port}`;
    return axios
      .post('/users', testUser1)
      .then(() => (transaction.request.body = JSON.stringify(testUser1)))
      .then(() => done())
      .catch(err => {
        console.log(err.response.data);
        return done();
      });
  }
);

after('Auth > Authorize to Receive a Token > Example 1', function(
  transaction,
  done
) {
  const body = JSON.parse(transaction.real.body);
  token1 = body.data.token;
  authHeader1 = `Bearer ${token1}`;
  return done();
});

// 400
before(
  'Auth > Authorize to Receive a Token > Example 2',
  (transaction, done) => {
    transaction.request.body = JSON.stringify(badRequest);
    return done();
  }
);

// 401
before(
  'Auth > Authorize to Receive a Token > Example 3',
  (transaction, done) => {
    const badUser = { data: { username: testUsername1, password: 'wrong' } };
    transaction.request.body = JSON.stringify(badUser);
    return done();
  }
);

// 404
before(
  'Auth > Authorize to Receive a Token > Example 4',
  (transaction, done) => {
    const newUser = { data: { username: 'bill', password: 'who cares' } };
    transaction.request.body = JSON.stringify(newUser);
    return done();
  }
);

// GET /users
// 200
before('Users > Get a List of Users > Example 1', (transaction, done) => {
  transaction.request.headers['Authorization'] = authHeader1;
  return done();
});
//400
before('Users > Get a List of Users > Example 2', (transaction, done) => {
  transaction.request.headers['Authorization'] = authHeader1;
  transaction.fullPath = '/users?limit=foo';
  return done();
});
// 401
before('Users > Get a List of Users > Example 3', (transaction, done) => {
  return done();
});

// POST /users
// 201
before('Users > Create a New User > Example 1', (transaction, done) => {
  transaction.request.body = JSON.stringify(testUser2);
  return done();
});
after('Users > Create a New User > Example 1', (transaction, done) => {
  transaction.request.body = JSON.stringify(testUser2);
  return axios
    .post('/auth', testUser2, {
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => {
      token2 = res.data.data.token;
      authHeader2 = `Bearer ${token2}`;
      return done();
    })
    .catch(err => {
      console.error(err);
      return done();
    });
});
// 400
before('Users > Create a New User > Example 2', (transaction, done) => {
  transaction.request.body = JSON.stringify(badRequest);
  return done();
});
// 409
before('Users > Create a New User > Example 3', (transaction, done) => {
  transaction.request.body = JSON.stringify(testUser2);
  return done();
});

// GET /users/:username
// 200
before('User > Get a User > Example 1', (transaction, done) => {
  transaction.request.headers['Authorization'] = authHeader2;
  transaction.fullPath = `/users/${testUsername2}`;
  return done();
});
// 401
before('User > Get a User > Example 2', (transaction, done) => {
  transaction.fullPath = `/users/${testUsername2}`;
  return done();
});
// 404
before('User > Get a User > Example 3', (transaction, done) => {
  transaction.request.headers['Authorization'] = authHeader2;
  transaction.fullPath = `/users/${fourOhFour}`;
  return done();
});

// PATCH /users/:username
// 200
before('User > Update a User > Example 1', (transaction, done) => {
  transaction.request.headers['Authorization'] = authHeader2;
  transaction.fullPath = `/users/${testUsername2}`;
  transaction.request.body = JSON.stringify({
    data: {
      name: 'Whiskey Lane'
    }
  });
  return done();
});
// 400
before('User > Update a User > Example 2', (transaction, done) => {
  transaction.request.headers['Authorization'] = authHeader2;
  transaction.fullPath = `/users/${testUsername2}`;
  transaction.request.body = JSON.stringify(badRequest);
  return done();
});
// 401
before('User > Update a User > Example 3', (transaction, done) => {
  return done();
});
// 404
before('User > Update a User > Example 4', (transaction, done) => {
  return axios
    .post(
      `/users`,
      { data: { name: 'fourOhFour', username: fourOhFour, password: '404' } },
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then(() => {
      return axios.post(
        '/auth',
        { data: { username: fourOhFour, password: '404' } },
        { headers: { 'Content-Type': 'application/json' } }
      );
    })
    .then(res => {
      fourOhFourToken = `Bearer ${res.data.data.token}`;
      return axios
        .delete(`/users/${fourOhFour}`, {
          headers: { Authorization: fourOhFourToken }
        })
        .then(() => {
          transaction.request.headers['Authorization'] = fourOhFourToken;
          transaction.fullPath = `/users/${fourOhFour}`;
          transaction.request.body = JSON.stringify({
            data: {
              name: 'Whiskey Lane'
            }
          });
          return done();
        })
        .catch(err => {
          console.log(err.response.data);
          return done();
        });
    })
    .catch(err => {
      console.log(err.response.data);
      return done();
    });
});

// DELETE /users/:username
// 200
before('User > Delete a User > Example 1', (transaction, done) => {
  transaction.request.headers['Authorization'] = authHeader2;
  transaction.fullPath = `/users/${testUsername2}`;
  return done();
});
// 401
before('User > Delete a User > Example 2', (transaction, done) => {
  transaction.request.headers['Authorization'] = authHeader2;
  transaction.fullPath = `/users/${testUsername1}`;
  return done();
});
// 404
before('User > Delete a User > Example 3', (transaction, done) => {
  transaction.request.headers['Authorization'] = fourOhFourToken;
  transaction.fullPath = `/users/${fourOhFour}`;
  return done();
});

// POST /users/:username/favorites/:storyId
// 200
before(
  'User Favorites > Add a New Favorite > Example 1',
  (transaction, done) => {
    return axios
      .post('/stories', testStory1, {
        headers: {
          Authorization: authHeader1,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        testStory1Id = res.data.data.storyId;
        transaction.request.headers['Authorization'] = authHeader1;
        transaction.fullPath = `/users/${testUsername1}/favorites/${testStory1Id}`;
        return done();
      })
      .catch(err => {
        console.log('meerkats');
        console.log(err.response.data);
        return done();
      });
  }
);
// 401
before(
  'User Favorites > Add a New Favorite > Example 2',
  (transaction, done) => {
    transaction.fullPath = `/users/${testUsername1}/favorites/${testStory1Id}`;
    return done();
  }
);
// 404
before(
  'User Favorites > Add a New Favorite > Example 3',
  (transaction, done) => {
    transaction.request.headers['Authorization'] = authHeader1;
    transaction.fullPath = `/users/${testUsername1}/favorites/${fourOhFour}`;
    return done();
  }
);

// DELETE /users/:username/favorites/:storyId
// 200
before(
  'User Favorites > Delete a User Favorite > Example 1',
  (transaction, done) => {
    transaction.request.headers['Authorization'] = authHeader1;
    transaction.fullPath = `/users/${testUsername1}/favorites/${testStory1Id}`;
    return done();
  }
);
// 401
before(
  'User Favorites > Delete a User Favorite > Example 2',
  (transaction, done) => {
    transaction.fullPath = `/users/${testUsername1}/favorites/${testStory1Id}`;
    return done();
  }
);
// 404
before(
  'User Favorites > Delete a User Favorite > Example 3',
  (transaction, done) => {
    transaction.request.headers['Authorization'] = authHeader1;
    transaction.fullPath = `/users/${testUsername1}/favorites/${fourOhFour}`;
    return done();
  }
);

// GET /stories
// 200
before('Stories > Get a List of Stories > Example 1', (transaction, done) => {
  return done();
});
// 400
before('Stories > Get a List of Stories > Example 2', (transaction, done) => {
  transaction.fullPath = '/stories?limit=foo';
  return done();
});

// POST /stories
// 201
before('Stories > Create a New Story > Example 1', (transaction, done) => {
  transaction.request.headers['Authorization'] = authHeader1;
  transaction.request.body = JSON.stringify(testStory2);
  return done();
});
after('Stories > Create a New Story > Example 1', (transaction, done) => {
  const response = JSON.parse(transaction.real.body);
  testStory2Id = response.data.storyId;
  return done();
});
// 400
before('Stories > Create a New Story > Example 2', (transaction, done) => {
  transaction.request.headers['Authorization'] = authHeader1;
  transaction.request.body = JSON.stringify(badRequest);
  return done();
});
// 401
before('Stories > Create a New Story > Example 3', (transaction, done) => {
  transaction.request.body = JSON.stringify(testStory2);
  return done();
});

// GET /stories/:storyId
// 200
before('Story > Get a Story > Example 1', (transaction, done) => {
  transaction.fullPath = `/stories/${testStory2Id}`;
  return done();
});
// 404
before('Story > Get a Story > Example 2', (transaction, done) => {
  transaction.fullPath = `/stories/${fourOhFour}`;
  return done();
});

// PATCH /stories/:storyId
//200
before('Story > Update a Story > Example 1', (transaction, done) => {
  transaction.fullPath = `/stories/${testStory2Id}`;
  transaction.request.headers['Authorization'] = authHeader1;
  transaction.request.body = JSON.stringify({ data: { author: 'Whiskey' } });
  return done();
});
// 400
before('Story > Update a Story > Example 2', (transaction, done) => {
  transaction.fullPath = `/stories/${testStory2Id}`;
  transaction.request.headers['Authorization'] = authHeader1;
  transaction.request.body = JSON.stringify(badRequest);
  return done();
});
// 401
before('Story > Update a Story > Example 3', (transaction, done) => {
  transaction.fullPath = `/stories/${testStory2Id}`;
  transaction.request.headers['Authorization'] = authHeader2;
  transaction.request.body = JSON.stringify({ data: { author: 'Whiskey' } });
  return done();
});
// 404
before('Story > Update a Story > Example 4', (transaction, done) => {
  transaction.fullPath = `/stories/${fourOhFour}`;
  transaction.request.headers['Authorization'] = authHeader1;
  transaction.request.body = JSON.stringify({ data: { author: 'Whiskey' } });
  return done();
});

// DELETE /stories/:storyId
// 200
before('Story > Delete a Story > Example 1', (transaction, done) => {
  transaction.fullPath = `/stories/${testStory2Id}`;
  transaction.request.headers['Authorization'] = authHeader1;
  return done();
});
// 401
before('Story > Delete a Story > Example 2', (transaction, done) => {
  transaction.fullPath = `/stories/${testStory1Id}`;
  transaction.request.headers['Authorization'] = authHeader2;
  return done();
});
// 404
before('Story > Delete a Story > Example 3', (transaction, done) => {
  transaction.fullPath = `/stories/${fourOhFour}`;
  transaction.request.headers['Authorization'] = authHeader1;
  return done();
});

after('Story > Delete a Story > Example 3', (transaction, done) => {
  return axios
    .delete(`/stories/${testStory1Id}`, {
      headers: { Authorization: authHeader1 }
    })
    .then(() => {
      return axios.delete(`/users/${testUsername1}`, {
        headers: { Authorization: authHeader1 }
      });
    })
    .then(() => done())
    .catch(err => {
      console.log(err);
      return done();
    });
});
