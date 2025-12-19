const db = require('../config/db');

class Group {
  static create(name) {
    const stmt = db.prepare('INSERT INTO groups (name) VALUES (?)');
    const info = stmt.run(name);
    return { id: info.lastInsertRowid, name };
  }

  static findAll() {
    return db.prepare('SELECT * FROM groups').all();
  }

  static addMember(groupId, userId) {
    const stmt = db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)');
    stmt.run(groupId, userId);
  }

  static getMembers(groupId) {
    return db.prepare(`
      SELECT users.id, users.name, users.email 
      FROM group_members 
      JOIN users ON group_members.user_id = users.id 
      WHERE group_members.group_id = ?
    `).all(groupId);
  }
}

module.exports = Group;