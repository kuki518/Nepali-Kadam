const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { isValidEmail, isStrongPassword } = require('../utils/validators');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 2 * 60 * 60 * 1000 // 2 hours
};

function signToken(user) {
  return jwt.sign({ sub: user.user_id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h'
  });
}

exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !isValidEmail(email)) return res.status(400).json({ error: 'Enter your name and a valid email' });
    if (!isStrongPassword(password)) return res.status(400).json({ error: 'Password needs 8+ characters with letters and numbers' });

    const exists = await db.query('SELECT 1 FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rowCount) return res.status(409).json({ error: 'An account with this email already exists' });

    const hash = await bcrypt.hash(password, 12);
    // New accounts always get the default 'user' role
    const result = await db.query(
      `INSERT INTO users (role_id, full_name, email, password_hash)
       VALUES ((SELECT role_id FROM roles WHERE name = 'user'), $1, $2, $3)
       RETURNING user_id, full_name, email`,
      [full_name.trim(), email.toLowerCase(), hash]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await db.query(
      `SELECT u.user_id, u.full_name, u.email, u.password_hash, u.is_active, r.name AS role
       FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.email = $1`,
      [String(email || '').toLowerCase()]
    );
    const user = result.rows[0];
    // Same message for wrong email or wrong password
    const ok = user && (await bcrypt.compare(password || '', user.password_hash));
    if (!ok || !user.is_active) return res.status(401).json({ error: 'Invalid email or password' });

    await db.query('UPDATE users SET last_login_at = NOW() WHERE user_id = $1', [user.user_id]);
    res.cookie('token', signToken(user), COOKIE_OPTIONS);
    res.json({ user: { id: user.user_id, full_name: user.full_name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

exports.logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: COOKIE_OPTIONS.secure });
  res.json({ message: 'Logged out' });
};

exports.me = async (req, res, next) => {
  try {
    const r = await db.query('SELECT user_id, full_name, email FROM users WHERE user_id = $1', [req.user.id]);
    res.json({ user: { ...r.rows[0], role: req.user.role } });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!isStrongPassword(new_password)) return res.status(400).json({ error: 'New password needs 8+ characters with letters and numbers' });
    const r = await db.query('SELECT password_hash FROM users WHERE user_id = $1', [req.user.id]);
    if (!(await bcrypt.compare(current_password || '', r.rows[0].password_hash)))
      return res.status(401).json({ error: 'Current password is incorrect' });
    await db.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [await bcrypt.hash(new_password, 12), req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
};

// Always responds the same way so attackers cannot find out which emails exist
exports.forgotPassword = async (req, res, next) => {
  try {
    const r = await db.query('SELECT user_id FROM users WHERE email = $1 AND is_active = TRUE', [String(req.body.email || '').toLowerCase()]);
    if (r.rowCount) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await db.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 minutes')`,
        [r.rows[0].user_id, tokenHash]
      );
      // TODO: send by email. For the SYP demo the link is printed in the server console.
      console.log(`Password reset link: http://localhost:${process.env.PORT || 3000}/pages/reset-password.html?token=${token}`);
    }
    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;
    if (!isStrongPassword(new_password)) return res.status(400).json({ error: 'Password needs 8+ characters with letters and numbers' });
    const tokenHash = crypto.createHash('sha256').update(String(token || '')).digest('hex');
    const r = await db.query(
      'SELECT token_id, user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()',
      [tokenHash]
    );
    if (!r.rowCount) return res.status(400).json({ error: 'Reset link is invalid or has expired' });
    await db.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [await bcrypt.hash(new_password, 12), r.rows[0].user_id]);
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE token_id = $1', [r.rows[0].token_id]);
    res.json({ message: 'Password has been reset' });
  } catch (err) { next(err); }
};
