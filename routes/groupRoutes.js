const express = require('express');
const router = express.Router();
const GroupService = require('../services/GroupService');
const BalanceService = require('../services/BalanceService');

router.get('/', (req, res) => {
  res.json(GroupService.getAllGroups());
});

router.post('/', (req, res) => {
  res.json(GroupService.createGroup(req.body.name));
});

router.post('/:id/users', (req, res) => {
  try {
    res.json(GroupService.addUserToGroup(req.params.id, req.body.userId));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get('/:id/members', (req, res) => {
  res.json(GroupService.getGroupMembers(req.params.id));
});

router.get('/:id/balances', (req, res) => {
  res.json({ balances: BalanceService.getGroupBalances(req.params.id) });
});

router.post('/:id/settle', (req, res) => {
  BalanceService.settleBalance(req.params.id, req.body.payerId, req.body.payeeId, req.body.amount);
  res.json({ success: true });
});

module.exports = router;