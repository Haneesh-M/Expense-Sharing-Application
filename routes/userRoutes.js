const express = require('express');
const router = express.Router();
const UserService = require('../services/UserService');

router.get('/', (req, res) => {
  res.json(UserService.getAllUsers());
});

router.post('/', (req, res) => {
  try {
    const user = UserService.createUser(req.body.name, req.body.email);
    res.json(user);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;