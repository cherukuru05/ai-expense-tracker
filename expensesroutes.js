const express = require('express');
const { body } = require('express-validator');
const {
  getExpenses, createExpense, getExpense, updateExpense, deleteExpense, getSummary,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const validateExpense = [
  body('description').trim().notEmpty().withMessage('Description required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount required'),
  body('date').optional().isISO8601().withMessage('Valid date required'),
];

router.get('/', getExpenses);
router.get('/summary', getSummary);
router.post('/', validateExpense, createExpense);
router.get('/:id', getExpense);
router.put('/:id', validateExpense, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;