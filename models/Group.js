const db = require('../config/db');

class Group {
  static create(name) {
    const info = db.prepare('INSERT INTO groups (name) VALUES (?)').run(name);
    return { id: info.lastInsertRowid, name };
  }

  static findAll() {
    return db.prepare('SELECT * FROM groups ORDER BY id DESC').all();
  }

  static delete(id) {
    return db.prepare('DELETE FROM groups WHERE id = ?').run(id);
  }

  static addMember(groupId, userId) {
    db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)').run(groupId, userId);
  }

  static getMembers(groupId) {
    return db.prepare(`
      SELECT u.id, u.name, u.email 
      FROM group_members gm 
      JOIN users u ON gm.user_id = u.id 
      WHERE gm.group_id = ?
    `).all(groupId);
  }
}

module.exports = Group;