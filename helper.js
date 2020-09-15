//Helper function to check email already exists in users DB
const getUserByEmail = (emailInput, database) => {
  for (let key in database) {
    if (emailInput === database[key]['email']) {
      return true;
    }
  }
  return false;
};

//Helper Function to generate random alphanumeric string
const generateRandomString = () => {
  let result = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

//Helper function to get data specific to user
const getUserSpecificData = (userId, urlDatabase) => {
  let userSpecificURL = {};
  for (let urls in urlDatabase) {
    if (urlDatabase[urls]['userID'] === userId) {
      userSpecificURL[urls] = urlDatabase[urls]['longURL'];
    }
  }
  return userSpecificURL;
};

module.exports = { getUserByEmail, generateRandomString, getUserSpecificData };