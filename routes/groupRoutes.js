const router = require('express').Router();
const GroupService = require('../services/GroupService');
const BalanceService = require('../services/BalanceService');
const Settlement = require('../models/Settlement');

router.get('/', (req, res) => res.json(GroupService.getAll()));
router.post('/', (req, res) => res.json(GroupService.create(req.body.name)));
router.delete('/:id', (req, res) => { GroupService.delete(req.params.id); res.json({success:true}); });

router.get('/:id/members', (req, res) => res.json(GroupService.getMembers(req.params.id)));
router.post('/:id/users', (req, res) => {
  try { res.json(GroupService.addUser(req.params.id, req.body.userId)); }
  catch(e) { res.status(400).json({ error: e.message }); }
});

router.post('/', (req, res) => {
  // Pass both name and mode from req.body
  res.json(GroupService.create(req.body.name, req.body.mode)); 
});

router.get('/:id/history', (req, res) => res.json(GroupService.getHistory(req.params.id)));

router.get('/:id/balances', (req, res) => {
  const mode = req.query.mode || 'PAIRWISE';
  res.json({ balances: BalanceService.getBalances(req.params.id, mode) });
});

router.post('/:id/settle', (req, res) => {
  Settlement.create(req.params.id, req.body.payerId, req.body.payeeId, req.body.amount);
  res.json({ success: true });
});

module.exports = router;