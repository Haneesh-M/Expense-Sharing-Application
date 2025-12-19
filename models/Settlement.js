const db = require('../config/db');

class Settlement {
  static create(groupId, payerId, payeeId, amount) {
    const stmt = db.prepare(`
      INSERT INTO settlements (group_id, payer_id, payee_id, amount)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(groupId, payerId, payeeId, amount);
  }

  static findByGroupId(groupId) {
    return db.prepare('SELECT * FROM settlements WHERE group_id = ?').all(groupId);
  }
}

module.exports = Settlement;