const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

app.use(bodyParser.json());
app.use(express.static('public'));

let users = [
  {
    id: 1,
    userName: 'Bella',
    favoriteMovies: [],
  },
  {
    id: 2,
    userName: 'Alex',
    favoriteMovies: ['The fountain'],
  },
];
let movies = [
  {
    Title: 'The Fountain',
    Description: 'On this very day .....',
    Genre: {
      Name: 'Drama',
      Description: 'Description of the genre',
    },
    Director: {
      Name: 'Daren',
      Bio: 'Directors Bio',
      Birth: 1989,
    },
    ImageURL: 'image of the movie',
    featured: false,
  },
  {
    Title: 'The Charger',
    Description: 'On this very day .....',
    Genre: {
      Name: 'dramatic',
      Description: 'Description of the genre',
    },
    Director: {
      Name: 'Daren',
      Bio: 'Directors Bio',
      Birth: 1989,
    },
    ImageURL: 'image of the movie',
    featured: false,
  },
];

// Return a list of ALL movies to the user;
// Read/get
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// Return properties of a specific movie based on title;
// Read/get
app.get('/movies/:title', (req, res) => {
  // const title = req.params.title
  const { title } = req.params; //objuct destructuring approach. graps the property
  const movie = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie');
  }
});

// Return properties of a specific movie title based on genre;
// Read/get
app.get('/movies/genre/:genreName', (req, res) => {
  // const title = req.params.title
  const { genreName } = req.params; //objuct destructuring approach. graps the property
  const genre = movies.find(
    (movie) => movie.Genre.Name === genreName
  ).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre');
  }
});
// Return properties of a director based on name;
// Read/get
app.get('/movies/director/:directorName', (req, res) => {
  // const title = req.params.title
  const { directorName } = req.params; //objuct destructuring approach. graps the property
  const director = movies.find(
    (movie) => movie.Director.Name === directorName
  ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director');
  }
});

// Allow new users to register;
// create/Post
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.userName) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('users need names');
  }
});

// Allow users to update their user info (username);
// put/update
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.userName = updatedUser.userName;
    res.status(200).json(user);
  } else {
    res.status(400).send('users does not exist');
  }
});

// Allow users to add a movie to their list of favorites 
// (showing only a text that a movie has been added—more on this later);
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    // const updatedUser = req.body;
  
    let user = users.find((user) => user.id == id);
  
    if (user) {
      user.favoriteMovies.push(movieTitle);
      // res.json(users)
      res.status(200).send(`${movieTitle} has been added`);
    } else {
      res.status(400).send('users does not exist');
    }
  });


//   Allow users to remove a movie from their list of favorites 
// (showing only a text that a movie has been removed—more on this later);
// delete/delete
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    // const updatedUser = req.body;
  
    let user = users.find((user) => user.id == id);
  
    if (user) {
      user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
      res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    } else {
      res.status(400).send('users does not exist');
    }
  });

//   Allow existing users to deregister 
//   (showing only a text that a user email has been removed—more on this later).
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    // const updatedUser = req.body;
  
    let user = users.find((user) => user.id == id);
  
    if (user) {
      users = users.filter(user => user.id != id);
    //   res.json(users)
      res.status(200).send(`user ${id} has been deleted`);
    } else {
      res.status(400).send('users does not exist');
    }
  });

app.listen(8080, () => console.log('listening on port 8080'));
