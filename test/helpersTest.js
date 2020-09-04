const { assert } = require('chai');

const { getUserByEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function () {
  it('should return true if email matches', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = true;
    assert.equal(user, expectedOutput);
  });

  it('should return false if email doesnot matches', function () {
    const user = getUserByEmail("xxxx@example.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});
