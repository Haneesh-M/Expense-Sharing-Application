const express = require('express');
const router = express.Router();
const ExpenseService = require('../services/ExpenseService');

router.post('/', (req, res) => {
  try {
    const id = ExpenseService.addExpense(
      req.body.groupId,
      req.body.payerId,
      req.body.amount,
      req.body.description,
      req.body.splitType,
      req.body.splitDetails || []
    );
    res.json({ expenseId: id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;