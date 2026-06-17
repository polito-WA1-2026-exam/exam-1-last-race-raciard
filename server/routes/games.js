import express from 'express';
const router = express.Router();

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({ error: 'Not authenticated' });
};

export default function(gameService, gameDao, userDao) {
    // GET /api/events
    router.get('/events', async (req, res) => {
        try {
            const events = await gameDao.getEvents();
            res.json(events);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // GET /api/ranking
    router.get('/ranking', async (req, res) => {
        try {
            const ranking = await userDao.getRanking();
            res.json(ranking);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // POST /api/games (Start a new game)
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

    // POST /api/games/result (Submit route and get result)
    router.post('/games/result', isLoggedIn, async (req, res) => {
        try {
            const { route } = req.body;
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

            const result = await gameService.executeRoute(route, failReason);

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
