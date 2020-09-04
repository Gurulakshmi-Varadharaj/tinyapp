//Helper function to check email already exists in users DB
const getUserByEmail = (emailInput, database) => {
  for (let key in database) {
    if (emailInput === database[key]['email']) {
      return true;
    }
  }
  return false;
};

module.exports = { getUserByEmail };