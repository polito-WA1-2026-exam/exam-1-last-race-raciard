import express from 'express';
const router = express.Router();

export default function(networkDao) {
    // GET /api/network
    router.get('/network', async (req, res) => {
        try {
            const network = await networkDao.getNetwork();
            res.json(network);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    return router;
}
