const db = require('../config/db');

class User {
  static create(name, email) {
    const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    const info = stmt.run(name, email);
    return { id: info.lastInsertRowid, name, email };
  }

  static findAll() {
    return db.prepare('SELECT * FROM users ORDER BY id DESC').all();
  }

  static delete(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }
}

module.exports = User;