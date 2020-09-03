//Using Express module to communicate between server and client browser(port)
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//Middleware - Body Parser - to make Buffer data in request readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Middleware - Cookie parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//Local Database - later use real DB
let users = {
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

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

//Helper function to check email already exists in users DB
const emailLookup = (emailInput) => {
  for (let key in users) {
    if (emailInput === users[key]['email']) {
      return false;
    }
  }
  return true;
};

//Express will use EJS Template Engine
app.set('view engine', 'ejs');

//Route for client-server interaction
//Using Template Engine to pass data from backend to frontend

//Root or Home page
app.get('/urls', (req, res) => {
  const userIdCookie = req.cookies['user_id'];
  let templateVars = { user: users[userIdCookie], urls: urlDatabase };
  return res.render('urls_index', templateVars);
});

//To show the form in browser
app.get("/urls/new", (req, res) => {
  const userIdCookie = req.cookies['user_id'];
  let templateVars = { user: users[userIdCookie] };
  return res.render("urls_new", templateVars);
});

//After submit, the POST method is called to save the newURL to urlDatabase
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  const redirectTO = `/u/${shortURL}`;
  return res.redirect(redirectTO);         // Respond with redirection to /urls/:shortURL
});

//Redirect using shortURL to longURL page using /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL];
    return res.redirect(longURL);
  } else {
    res.statusCode = 404;
    return res.send('404: Page not found');
  }
});

//Using Template Engine to pass data from frontend to backend and vice versa
app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const userIdCookie = req.cookies['user_id'];
    let templateVars = { user: users[userIdCookie], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    return res.render('urls_show', templateVars);
  } else {
    res.statusCode = 404;
    return res.send(`${res.statusCode}: Page not found`);
  }
});

//Using POST instead of DELETE method to delete a data from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  return res.redirect('/urls');
});

//Using POST to redirect from index page to show page
app.post('/urls/:shortURL/edit', (req, res) => {
  let redirectTo = `/urls/${req.params.shortURL}`;
  return res.redirect(redirectTo);
});

//Using POST instead of PUT method to Edit the longURL
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  if (longURL === '') {
    res.statusCode = 400;
    return res.send(`${res.statusCode}: Bad Request`);
  }
  const userIdCookie = req.cookies['user_id'];
  urlDatabase[req.params.shortURL] = longURL;
  let templateVars = { user: users[userIdCookie], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  return res.render('urls_show', templateVars);
});

//Setting cookies with user login form from _header.ejs
/***app.post('/login', (req, res) => {
  const userName = req.body.username;
  res.cookie('username', userName);
  return res.redirect('/urls');
});***/

//Clearing cookies with user logout form from _header.ejs
/***app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  return res.redirect('/urls');
});***/

//User Registration page
app.get('/register', (req, res) => {
  return res.render('user_register');
});

//POST endpoint for Registration page to store the user details in users object
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  //Handling Registration Errors
  if (email === '' || password === '') {
    res.statusCode = 400;
    return res.send(`${res.statusCode}: Bad Request`);
  } else {
    const valdiateEamil = emailLookup(email);
    if (!valdiateEamil) {
      res.statusCode = 400;
      return res.send(`${res.statusCode}: Bad Request`);
    }
  }
  const id = generateRandomString();
  users[id] = { id, email, password };
  res.cookie('user_id', id);
  return res.redirect('/urls');
});

//User Login Form
app.get('/login', (req, res) => {
  return res.render('user_login');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  return res.redirect('/login');
});

//Server Connection to port
app.listen(PORT, () => {
  console.log(`Example app listening to port ${PORT}`);
});