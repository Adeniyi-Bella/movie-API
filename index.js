// import external packages express and morgan
const express = require('express'),
  morgan = require('morgan'),
  // import built in node modules
  fs = require('fs'),
  path = require('path');
// create an instance of express
const app = express();
// movies array for movies endpoint
let movies = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Lord of the Rings',
    author: 'J.R.R. Tolkien',
  },
  {
    title: 'Twilight',
    author: 'Stephanie Meyer',
  },
];

// create a write stream (in append mode)
// a ‘log.txt’ file is automatically created in root directory
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'log.txt'),
  { flags: 'a' }
);

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));
// serve static files loated in public file
app.use(express.static('public'));

// GET requests/endpoints
//   home page url/endpoint
app.get('/', (req, res) => {
  res.send('Welcome to my movies API page!');
});

//   movies endpoint
app.get('/movies', (req, res) => {
  res.json(movies);
});
// error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
