import express from 'express';
const router = express.Router();

/**
 * Express middleware to check if the request is authenticated.
 * If not authenticated, returns a 401 response.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void}
 */
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({ error: 'Not authenticated' });
};

/**
 * Configures and returns the Express router containing routes for game play,
 * ranking tables, and random transit events retrieval.
 * @param {Object} gameService - The game service instance handling business logic.
 * @param {Object} gameDao - The game DAO handling database operations for games.
 * @param {Object} userDao - The user DAO handling database operations for users.
 * @returns {Object} The configured Express router object.
 */
export default function (gameService, gameDao, userDao) {
    /**
     * GET /api/events
     * Retrieves all possible random game events.
     * @name GET/api/events
     * @function
     * @memberof module:routes/games
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    router.get('/events', async (req, res) => {
        try {
            const events = await gameDao.getEvents();
            res.json(events);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    /**
     * GET /api/ranking
     * Retrieves the global leaderboard rankings (best score per user). Requires authentication.
     * @name GET/api/ranking
     * @function
     * @memberof module:routes/games
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    router.get('/ranking', isLoggedIn, async (req, res) => {
        try {
            const ranking = await userDao.getRanking();
            res.json(ranking);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    /**
     * POST /api/games
     * Starts a new game by selecting random start/destination stations and storing start state in session. Requires authentication.
     * @name POST/api/games
     * @function
     * @memberof module:routes/games
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    router.post('/games', isLoggedIn, async (req, res) => {
        try {
            const { start, destination } = await gameService.getRandomStations();
            req.session.currentGame = {
                startId: start.id,
                destinationId: destination.id,
                startTime: Date.now()
            };
            res.json({ start, destination });
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    /**
     * POST /api/games/result
     * Validates and executes the submitted route, saving the score result to the database and clearing the active session game. Requires authentication.
     * @name POST/api/games/result
     * @function
     * @memberof module:routes/games
     * @param {Object} req - Express request object.
     * @param {Object} req.body - The request body.
     * @param {number[]} req.body.route - Array of station IDs representing the chosen route.
     * @param {Object} res - Express response object.
     */
    router.post('/games/result', isLoggedIn, async (req, res) => {
        try {
            const { route } = req.body;

            if (!Array.isArray(route) || !route.every(seg => Array.isArray(seg) && seg.length === 2 && Number.isInteger(seg[0]) && Number.isInteger(seg[1]))) {
                return res.status(400).json({ error: 'Invalid route format. Expected an array of station pairs: [[s1, s2], ...]' });
            }

            const currentGame = req.session.currentGame;

            if (!currentGame) {
                return res.status(400).json({ error: 'No active game' });
            }

            let failReason;
            try {
                failReason = await gameService.validateRoute(route, currentGame);
            } catch (err) {
                if (err.type === 'TIMEOUT') {
                    return res.status(403).json({ error: err.message });
                }
                throw err;
            }

            const result = await gameService.executeRoute(route, failReason, currentGame);

            // Save result
            await gameDao.addGame(req.user.id, currentGame.startId, currentGame.destinationId, result.score);

            // Clear current game
            delete req.session.currentGame;

            res.json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    return router;
}
