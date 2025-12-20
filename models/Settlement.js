const db = require('../config/db');

class Settlement {
  static create(groupId, payerId, payeeId, amount) {
    db.prepare(`
      INSERT INTO settlements (group_id, payer_id, payee_id, amount)
      VALUES (?, ?, ?, ?)
    `).run(groupId, payerId, payeeId, amount);
  }

  static findByGroupId(groupId) {
    return db.prepare('SELECT * FROM settlements WHERE group_id = ? ORDER BY created_at DESC').all(groupId);
  }
}

module.exports = Settlement;