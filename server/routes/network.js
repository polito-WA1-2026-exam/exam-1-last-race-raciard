import express from 'express';
const router = express.Router();

export default function(networkDao) {
    // GET /api/stations
    router.get('/stations', async (req, res) => {
        try {
            const stations = await networkDao.getStations();
            res.json(stations);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // GET /api/lines
    router.get('/lines', async (req, res) => {
        try {
            const lines = await networkDao.getLines();
            res.json(lines);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // GET /api/segments
    router.get('/segments', async (req, res) => {
        try {
            const segments = await networkDao.getSegments();
            res.json(segments);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    return router;
}
