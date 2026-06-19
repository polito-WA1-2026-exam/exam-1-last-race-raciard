import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';

import NetworkDao from './dao/network-dao.js';
import UserDao from './dao/user-dao.js';
import GameDao from './dao/game-dao.js';
import GameService from './game-service.js';

import sessionRouter from './routes/sessions.js';
import networkRouter from './routes/network.js';
import gamesRouter from './routes/games.js';

// Init DAOs
const networkDao = new NetworkDao();
const userDao = new UserDao();
const gameDao = new GameDao();
const gameService = new GameService(networkDao, gameDao);

// Init Express
const app = express();
const port = 3001;

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));

// Setup Session
app.use(session({
  secret: 'a secret sentence not to share with anybody and seals all the cookies',
  resave: false,
  saveUninitialized: false
}));

// Setup Passport
app.use(passport.initialize());
app.use(passport.session());

/**
 * Callback function used by Passport LocalStrategy to verify user credentials.
 * @param {string} username - The username provided during login.
 * @param {string} password - The plain-text password provided during login.
 * @param {Function} cb - The passport done callback, which accepts (err, user, info).
 * @returns {Promise<void>}
 */
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  try {
    const user = await userDao.getUser(username, password);
    if (!user)
      return cb(null, false, 'Incorrect username or password.');
    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
}));

/**
 * Serializes the user object into the session.
 * @param {Object} user - The authenticated user object.
 * @param {Function} cb - The callback function.
 * @returns {void}
 */
passport.serializeUser((user, cb) => {
  cb(null, user);
});

/**
 * Deserializes the user object from the session.
 * @param {Object} user - The user identification stored in the session.
 * @param {Function} cb - The callback function.
 * @returns {void}
 */
passport.deserializeUser((user, cb) => {
  return cb(null, user);
});

/*** Routes ***/
app.use('/api/sessions', sessionRouter);
app.use('/api', networkRouter(networkDao));
app.use('/api', gamesRouter(gameService, gameDao, userDao));

// Start Server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
