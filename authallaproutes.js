// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, refresh } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], login);

router.get('/me', protect, getMe);
router.post('/refresh', protect, refresh);

module.exports = router;