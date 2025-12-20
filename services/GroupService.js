const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

class GroupService {
  static create(name) { return Group.create(name); }
  static getAll() { return Group.findAll(); }
  static delete(id) { return Group.delete(id); }
  
  static addUser(gid, uid) {
    try { Group.addMember(gid, uid); return { success: true }; }
    catch(e) { throw new Error("User already added or invalid ID"); }
  }

  static getMembers(gid) { return Group.getMembers(gid); }

  static getHistory(gid) {
    const expenses = Expense.findByGroupId(gid).map(e => ({
      type: 'EXPENSE', id: e.id, date: e.created_at,
      desc: e.description, payer: e.payer_id, amount: e.amount
    }));
    const settlements = Settlement.findByGroupId(gid).map(s => ({
      type: 'SETTLEMENT', id: s.id, date: s.created_at,
      desc: 'Payment', payer: s.payer_id, payee: s.payee_id, amount: s.amount
    }));
    return [...expenses, ...settlements].sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}
module.exports = GroupService;