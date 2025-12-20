const db = require('../config/db');

class Expense {
  static create(groupId, payerId, amount, description, splitType, splits) {
    const tx = db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO expenses (group_id, payer_id, amount, description, split_type)
        VALUES (?, ?, ?, ?, ?)
      `);
      const info = stmt.run(groupId, payerId, amount, description, splitType);
      const expenseId = info.lastInsertRowid;

      const splitStmt = db.prepare(`
        INSERT INTO expense_splits (expense_id, user_id, amount)
        VALUES (?, ?, ?)
      `);

      for (const split of splits) {
        if (split.userId !== payerId && split.amount > 0) {
          splitStmt.run(expenseId, split.userId, split.amount);
        }
      }
      return expenseId;
    });
    return tx();
  }

  static findByGroupId(groupId) {
    const expenses = db.prepare('SELECT * FROM expenses WHERE group_id = ? ORDER BY created_at DESC').all(groupId);
    const splitQuery = db.prepare('SELECT user_id, amount FROM expense_splits WHERE expense_id = ?');
    
    for (const exp of expenses) {
      exp.splits = splitQuery.all(exp.id);
    }
    return expenses;
  }

  static delete(id) {
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM expense_splits WHERE expense_id = ?').run(id);
      db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    });
    return tx();
  }
}

module.exports = Expense;