const router = require('express').Router();
const ExpenseService = require('../services/ExpenseService');
const Expense = require('../models/Expense');

router.post('/', (req, res) => {
  try {
    const id = ExpenseService.add(req.body);
    res.json({ expenseId: id });
  } catch(e) { res.status(400).json({ error: e.message }); }
});

router.delete('/:id', (req, res) => {
  Expense.delete(req.params.id);
  res.json({ success: true });
});

module.exports = router;