const Expense = require('../models/Expense');
const Group = require('../models/Group');

class ExpenseService {
  static add(data) {
    const { groupId, payerId, amount, description, splitType, splitDetails } = data;
    
    // Validations
    const members = Group.getMembers(groupId).map(m => m.id);
    if (!members.includes(payerId)) throw new Error("Payer is not in the group");

    // Calculation Logic
    let splits = [];
    let calcTotal = 0;

    if (splitType === 'EQUAL') {
      const targets = splitDetails?.length ? splitDetails.map(s => s.userId) : members;
      const base = Math.floor(amount / targets.length);
      const rem = amount % targets.length;
      targets.forEach((uid, i) => splits.push({ userId: uid, amount: base + (i < rem ? 1 : 0) }));
    } 
    else if (splitType === 'EXACT') {
      splits = splitDetails;
      calcTotal = splits.reduce((sum, s) => sum + s.value, 0);
      if (calcTotal !== amount) throw new Error("Split amounts do not match total");
      splits = splits.map(s => ({ userId: s.userId, amount: s.value }));
    }
    else if (splitType === 'PERCENT') {
      let runningTotal = 0;
      splits = splitDetails.map(s => {
        const share = Math.round((amount * s.value) / 100);
        runningTotal += share;
        return { userId: s.userId, amount: share };
      });
      // Fix rounding error
      if (splits.length && amount - runningTotal !== 0) {
        splits[0].amount += (amount - runningTotal);
      }
    }

    return Expense.create(groupId, payerId, amount, description, splitType, splits);
  }
}
module.exports = ExpenseService;