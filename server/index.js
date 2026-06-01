import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';

import NetworkDao from './dao/network-dao.js';
import UserDao from './dao/user-dao.js';
import GameDao from './dao/game-dao.js';

// Init DAOs
const networkDao = new NetworkDao();
const userDao = new UserDao();
const gameDao = new GameDao();

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

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    return cb(null, user);
});

// Auth Middleware
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({ error: 'Not authenticated' });
};

/*** APIs ***/

// GET /api/stations
app.get('/api/stations', async (req, res) => {
    try {
        const stations = await networkDao.getStations();
        res.json(stations);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/lines
app.get('/api/lines', async (req, res) => {
    try {
        const lines = await networkDao.getLines();
        res.json(lines);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/segments
app.get('/api/segments', async (req, res) => {
    try {
        const segments = await networkDao.getSegments();
        res.json(segments);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/events
app.get('/api/events', async (req, res) => {
    try {
        const events = await gameDao.getEvents();
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/ranking
app.get('/api/ranking', async (req, res) => {
    try {
        const ranking = await userDao.getRanking();
        res.json(ranking);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/*** Session APIs ***/

// POST /api/sessions (Login)
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json(info);
        
        req.login(user, (err) => {
            if (err) return next(err);
            return res.json(req.user);
        });
    })(req, res, next);
});

// DELETE /api/sessions/current (Logout)
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
        res.end();
    });
});

// GET /api/sessions/current (Check status)
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
