const router = require('express').Router();
const UserService = require('../services/UserService');

router.get('/', (req, res) => res.json(UserService.getAll()));
router.post('/', (req, res) => {
  try { res.json(UserService.create(req.body.name, req.body.email)); }
  catch(e) { res.status(400).json({ error: e.message }); }
});
router.delete('/:id', (req, res) => {
  try { res.json(UserService.delete(req.params.id)); }
  catch(e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;