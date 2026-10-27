const router = require('express').Router();
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// Every route here needs a logged-in admin
router.use(authenticate, authorize('admin'));

// Admins see account information only, never users' activity or location data
router.get('/users', async (req, res, next) => {
  try {
    const r = await db.query(
      `SELECT u.user_id, u.full_name, u.email, r.name AS role, u.is_active, u.created_at
       FROM users u JOIN roles r ON r.role_id = u.role_id ORDER BY u.created_at DESC`
    );
    res.json({ users: r.rows });
  } catch (err) { next(err); }
});

router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') return res.status(400).json({ error: 'is_active must be true or false' });
    if (Number(req.params.id) === Number(req.user.id)) return res.status(400).json({ error: 'You cannot deactivate your own account' });
    const r = await db.query('UPDATE users SET is_active = $1 WHERE user_id = $2 RETURNING user_id, is_active', [is_active, req.params.id]);
    if (!r.rowCount) return res.status(404).json({ error: 'User not found' });
    res.json({ user: r.rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
