const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const PassportLocal = require('passport-local');
const debug = require('debug')('cpt:server');
const cors = require('cors');
const mustbe = require('mustbe');

// Configure mustbe
const mustbeConfig = require('./mustbe-config');
mustbe.configure(mustbeConfig);

const userRouter = require('./routes/user');
const projectRouter = require('./routes/project');
const User = require('./models/user');

const app = express();

passport.use(new PassportLocal({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return done(null, false, { message: 'Email or password incorrect' });
      }

      return user.comparePassword(password);
    })
    .then((user) => {
      // Successful login
      done(null, user);
    })
    .catch(() => {
      // Password incorrect
      done(null, false, { message: 'Email or password incorrect' });
    });
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Mount the api routes
const apiRouter = new express.Router();
apiRouter.use('/user', userRouter);
apiRouter.use('/project', projectRouter);

// Handle auth
apiRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (!user) return res.status(401).json({ message: 'Email or password is incorrect' });

    const token = user.getToken();
    return res.status(200).json({ token });
  })(req, res, next);
});

// Mount the API
app.use('/api', apiRouter);

/* istanbul ignore next */
app.use((err, req, res, next) => { // eslint-disable-line
  if (err.isBoom) {
    return res.status(err.output.statusCode).json(err.output.payload);
  }
  debug(err);
  return res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
