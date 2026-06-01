import express from 'express';
import passport from 'passport';

const router = express.Router();

// POST /api/sessions (Login)
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

// DELETE /api/sessions/current (Logout)
router.delete('/current', (req, res) => {
    req.logout(() => {
        res.end();
    });
});

// GET /api/sessions/current (Check status)
router.get('/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

export default router;
