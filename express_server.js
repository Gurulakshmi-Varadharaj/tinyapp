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

//Helper Function to generate random alphanumeric string
const generateRandomString = function () {
  let result = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

//Express will use EJS Template Engine
app.set('view engine', 'ejs');

//Local Database - later use real DB
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Root or Home page
/***app.get('/', (req, res) => {
  res.send('Hello!');
});

//Get the URL list as String which is defined as Object
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//Add HTML as rsponse
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});****/

//Using Template Engine to pass data from backend to frontend
app.get('/urls', (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//To show the form in browser
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//After submit, the POST method is called to save the newURL to urlDatabase
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  const redirectTO = `/u/${shortURL}`;
  res.redirect(redirectTO);         // Respond with redirection to /urls/:shortURL
});

//Redirect using shortURL to longURL page using /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.send('404: Page not found');
  }
});

//Using Template Engine to pass data from frontend to backend and vice versa
app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render('urls_show', templateVars);
  } else {
    res.statusCode = 404;
    res.send('404: Page not found');
  }
});

//Using POST instead of DELETE method to delete a data from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//Using POST instead of PUT method to redirect from index page to show page
app.post('/urls/:shortURL/edit', (req, res) => {
  let redirectTo = `/urls/${req.params.shortURL}`;
  res.redirect(redirectTo);
});

//Using POST instead of PUT method to update the longURL
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = longURL;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

//Setting cookies with user login form from _header.ejs
app.post('/login', (req, res) => {
  const userName = req.body.username;
  res.cookie('username', userName);
  res.redirect('/urls');
});

//Clearing cookies with user logout form from _header.ejs
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

//User Registration page
app.get('/register', (req, res) => {
  res.render('user_register');
});

//Server Connection to port
app.listen(PORT, () => {
  console.log(`Example app listening to port ${PORT}`);
});