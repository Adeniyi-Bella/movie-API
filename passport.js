// importing neccessary packages
const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

// accessing db.users
let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      // takes a username and password from the request body
      usernameField: 'Username',
      passwordField: 'Password',
    },
    (username, password, callback) => {
      console.log(username + '  ' + password);
      // uses Mongoose to check your database for a user with the same username
      // password doesn't get checked here. In excs 2.10, it was done
      Users.findOne({ Username: username }, (error, user) => {
        if (error) {
          console.log(error);
          return callback(error);
        }

        if (!user) {
          console.log('incorrect username');
          return callback(null, false, {
            message: 'Incorrect username or password.',
          });
        }

        if (!user.validatePassword(password)) {
          console.log('incorrect password');
          return callback(null, false, {message: 'Incorrect password.'});
        }
        
        console.log('finished');
    // If there’s a match, the callback function will be executed
    // (this will be your login endpoint, which you’ll be exploring
        //    further in the next section).
        return callback(null, user);
      });
    }
  )
);

// second strategy. allows to authenticate users based on the
//  JWT submitted alongside their request
passport.use(
  new JWTStrategy(
    {
      // extract JWT submitted alongside request from bearer token
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      // a “secret” key to verify the signature of the JWT
      secretOrKey: 'your_jwt_secret',
    },
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
