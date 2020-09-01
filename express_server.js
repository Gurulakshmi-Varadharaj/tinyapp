const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//Express will use EJS Template
app.set('view engine', 'ejs');

//Local oject 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Middleware - Body Parser - to make Buffer data in request readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

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

//Using Template Engine to pass data from frontend to backend and vice versa
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

//Server Connection to port
app.listen(PORT, () => {
  console.log(`Example app listening to port ${PORT}`);
})