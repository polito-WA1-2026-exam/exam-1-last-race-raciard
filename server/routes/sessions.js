import express from 'express';
import passport from 'passport';

const router = express.Router();

/**
 * POST /api/sessions
 * Authenticates a user using passport local strategy and starts a session.
 * @name POST/api/sessions
 * @function
 * @memberof module:routes/sessions
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.username - User's username.
 * @param {string} req.body.password - User's password.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
router.post('', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json(info);
        
        req.login(user, (err) => {
            if (err) return next(err);
            return res.json(req.user);
        });
    })(req, res, next);
});

/**
 * DELETE /api/sessions/current
 * Logs out the currently authenticated user and destroys their session.
 * @name DELETE/api/sessions/current
 * @function
 * @memberof module:routes/sessions
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.delete('/current', (req, res) => {
    req.logout(() => {
        res.status(204).end();
    });
});

/**
 * GET /api/sessions/current
 * Checks authentication status and returns the currently logged-in user details.
 * @name GET/api/sessions/current
 * @function
 * @memberof module:routes/sessions
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get('/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

export default router;
