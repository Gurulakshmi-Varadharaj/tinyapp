//Using Express module to communicate between server and client browser(port)
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//Refactor to test helper functions
const { getUserByEmail, generateRandomString, getUserSpecificData } = require('./helper');

//Middleware - Body Parser - to make Buffer data in request readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Middleware - bcrypt for hashing password
const bcrypt = require('bcrypt');

//Middleware - cookie-seesion to encrypt the cookie
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

//Local Database - later use real DB
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

let currentUser = '';

//Express uses EJS Template Engine
app.set('view engine', 'ejs');

//Route for client-server interaction
//Using Template Engine to pass data from backend to frontend

app.get('/', (req, res) => {
  return res.redirect('/login');
});

//Root or Home page
app.get('/urls', (req, res) => {
  const userIdCookie = req.session.userId;
  if (userIdCookie !== undefined) {
    const urlsData = getUserSpecificData(currentUser, urlDatabase);   //Get User Specific Data
    let templateVars = { user: users[userIdCookie], urls: urlsData };
    return res.render('urls_index', templateVars);
  } else {
    return res.redirect('/login');
  }
});

//To show the create URL form in browser
app.get("/urls/new", (req, res) => {
  const userIdCookie = req.session.userId;
  if (userIdCookie !== undefined) {
    let templateVars = { user: users[userIdCookie] };
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect('/login');
  }
});

//After submit, the POST method is called to save the newURL to urlDatabase
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  if (longURL !== '') {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL, userID: currentUser };
    const redirectTO = `/urls/${shortURL}`;
    return res.redirect(redirectTO);         // Respond with redirection to /urls/:shortURL
  } else {
    res.statusCode = 404;
    return res.send('404: Page not found');
  }
});

//Redirect using shortURL to longURL page using /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = `${req.params.shortURL}`;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL]['longURL'];
    return res.redirect(longURL);
  } else {
    res.statusCode = 404;
    return res.send('404: Page not found');
  }
});

//Using Template Engine to pass data from frontend to backend and vice versa
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = `${req.params.shortURL}`;
  if (req.session.userId != null) {
    if (urlDatabase[shortURL] && urlDatabase[shortURL]['userID'] === currentUser) {
      let templateVars = { user: users[currentUser], shortURL, longURL: urlDatabase[shortURL]['longURL'] };
      return res.render('urls_show', templateVars);
    } else {
      res.statusCode = 404;
      return res.send(`${res.statusCode}: Page not found`);
    }
  } else {
    res.statusCode = 404;
    return res.send(`${res.statusCode}: Page not found`);
  }
});

//Using POST instead of DELETE method to delete a data from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  const userIdCookie = req.session.userId;
  if (userIdCookie !== undefined) {
    const shortURL = `${req.params.shortURL}`;
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
});

//Using POST to redirect from index page to show page
app.post('/urls/:shortURL/edit', (req, res) => {
  const userIdCookie = req.session.userId;
  if (userIdCookie !== undefined) {
    let redirectTo = `/urls/${req.params.shortURL}`;
    return res.redirect(redirectTo);
  }
});

//Using POST instead of PUT method to Edit the longURL
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  if (longURL === '') {
    res.statusCode = 400;
    return res.send(`${res.statusCode}: Bad Request`);
  }
  const shortURL = `${req.params.shortURL}`;
  urlDatabase[shortURL]['longURL'] = longURL;
  let templateVars = { user: users[currentUser], shortURL, longURL: urlDatabase[shortURL]['longURL'] };
  return res.render('urls_show', templateVars);
});

//User Registration page
app.get('/register', (req, res) => {
  req.session = null;
  let templateVars = { user: users };
  return res.render('user_register', templateVars);
});

//POST endpoint for Registration page to store the user details in users object
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  //Handling Registration Errors
  if (email === '' || password === '') {
    res.statusCode = 400;
    return res.send(`${res.statusCode}: Enter EmailId and Password`);
  } else {
    const valdateEmail = getUserByEmail(email, users);
    if (valdateEmail) {
      res.statusCode = 400;
      return res.send(`${res.statusCode}: EmailId is already registered`);
    }
  }
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = { id, email, hashedPassword };
  currentUser = id;
  req.session.userId = currentUser;
  return res.redirect('/urls');
});

//User Login Form
app.get('/login', (req, res) => {
  let templateVars = { user: users };
  return res.render('user_login', templateVars);
});

//Checking email and password stored in users object and handling user Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const valdiateEmail = getUserByEmail(email, users);
  if (valdiateEmail) {
    for (let key in users) {
      if (users[key]['email'] === email && bcrypt.compareSync(password, users[key]['hashedPassword'])) {
        req.session.userId = users[key]['id'];
        currentUser = users[key]['id'];
        return res.redirect('/urls');
      }
    }
    res.statusCode = 403;
    return res.send(`${res.statusCode}: Incorrect EmailId or Password`);
  } else {
    res.statusCode = 403;
    return res.send(`${res.statusCode}: EmailId doesnot exist`);
  }
});

//Logout handler - clearing cookies
app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/login');
});

//Server Connection to port
app.listen(PORT, () => {
  console.log(`Example app listening to port ${PORT}`);
});