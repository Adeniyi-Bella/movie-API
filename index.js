const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  cors = require('cors'),
  bcrypt = require('bcrypt'),
  { check, validationResult } = require('express-validator');
require('dotenv').config();

// let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         // If a specific origin isn’t found on the list of allowed origins
//         let message =
//           'The CORS policy for this application doesn’t allow access from origin ' +
//           origin;
//         return callback(new Error(message), false);
//       }
//       return callback(null, true);
//     },
//   })
// );
app.use(cors()); //allow request from all origins
app.use(express.static('public'));
// To get the body data i.e json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// to ensure your application can make use of your
// “auth.js” file, and that your “auth.js” file can use Express
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
// To load static files

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// mongoose.disconnect()
// process.env.CONNECTION_URI
// mongoose.connect('mongodb+srv://Governor239:Governor239@remote-db.xwyuh8n.mongodb.net/?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true });

// get users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// Return a list of ALL movies to the user;
// Read/get
app.get(
  '/movies',
  // passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        console.log(movies);
        if (movies.Title){
        res.status(201).json(movies);}
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// Return properties of a specific movie based on title;
// Read/get
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }),(req, res) => {
  console.log('Here', req.params.Title);
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
      // res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// Return properties of a specific movie title based on genre;
// Read/get
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ genres: req.params.genreName })
    .then((movie) => {
      res.json(movie);
      // res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Allow new users to register;
// create/Post

app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    // Validation logic above for request
    //you can either use a chain of methods like .not().isEmpty()
    //which means "opposite of isEmpty" in plain english "is not empty"
    //or use .isLength({min: 5}) which means
    //minimum value of 5 characters are only allowed

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res
            .status(400)
            .send(req.body.Username + 'already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              console.log(user);
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// Allow users to update their user info (username);
// put/update
app.put('/users/:username', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// app.listen(8080, () => console.log('listening on port 8080'));

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
