import express from 'express';
const router = express.Router();

/**
 * Configures and returns the Express router containing network topology routes.
 * @param {Object} networkDao - The network DAO handling database operations for the metro network.
 * @returns {Object} The configured Express router object.
 */
export default function(networkDao) {
    /**
     * GET /api/network
     * Retrieves the entire transit network structure including stations and lines.
     * @name GET/api/network
     * @function
     * @memberof module:routes/network
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
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
