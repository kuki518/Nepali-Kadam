const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Limit repeated login / reset attempts (brute-force protection)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many attempts, try again later' } });

router.post('/register', c.register);
router.post('/login', authLimiter, c.login);
router.post('/logout', authenticate, c.logout);
router.get('/me', authenticate, c.me);
router.put('/password', authenticate, c.changePassword);
router.post('/forgot-password', authLimiter, c.forgotPassword);
router.post('/reset-password', authLimiter, c.resetPassword);

module.exports = router;
