const express = require('express');
const Bill = require('../models/Bill');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const bills = await Bill.find({ user: req.user.id }).sort({ dueDate: 1 });
    res.json({ bills });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const bill = await Bill.create({ ...req.body, user: req.user.id });
    res.status(201).json({ bill });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json({ bill });
  } catch (e) { next(e); }
});

router.patch('/:id/pay', async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isPaid: true, paidDate: new Date() },
      { new: true }
    );
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json({ bill });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Bill.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Bill deleted' });
  } catch (e) { next(e); }
});

module.exports = router;