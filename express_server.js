const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = function () {
  let result = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

//Express will use EJS Template
app.set('view engine', 'ejs');

//Local Database - later use real DB
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Middleware - Body Parser - to make Buffer data in request readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

//Root or Home page
app.get('/', (req, res) => {
  res.send('Hello!');
});

//Get the URL list as String which is defined as Object
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//Add HTML as rsponse
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//Using Template Engine to pass data from backend to frontend
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//To show the form in browser
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render('urls_show', templateVars);
  } else {
    res.statusCode = 404;
    res.send('404: Page not found');
  }
});

//Server Connection to port
app.listen(PORT, () => {
  console.log(`Example app listening to port ${PORT}`);
});