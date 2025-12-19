const Expense = require('../models/Expense');
const Group = require('../models/Group');

class ExpenseService {
  static addExpense(groupId, payerId, amount, description, splitType, splitDetails) {
    const members = Group.getMembers(groupId).map(m => m.id);
    if (!members.includes(payerId)) throw new Error("Payer must be a member of the group");

    let finalSplits = [];
    let totalCalculated = 0;

    // --- 1. EQUAL SPLIT ---
    if (splitType === 'EQUAL') {
      const involvedUserIds = splitDetails.length > 0 ? splitDetails.map(s => s.userId) : members;
      const count = involvedUserIds.length;
      const baseShare = Math.floor(amount / count);
      const remainder = amount % count;

      involvedUserIds.forEach((uid, index) => {
        let share = baseShare + (index < remainder ? 1 : 0);
        finalSplits.push({ userId: uid, amount: share });
      });
    }
    // --- 2. EXACT SPLIT ---
    else if (splitType === 'EXACT') {
      splitDetails.forEach(s => {
        finalSplits.push({ userId: s.userId, amount: s.value });
        totalCalculated += s.value;
      });
      if (totalCalculated !== amount) throw new Error("Split amounts do not match total");
    }
    // --- 3. PERCENTAGE SPLIT ---
    else if (splitType === 'PERCENT') {
      let currentTotal = 0;
      splitDetails.forEach(s => {
        const share = Math.round((amount * s.value) / 100);
        finalSplits.push({ userId: s.userId, amount: share });
        currentTotal += share;
      });
      
      const diff = amount - currentTotal;
      if (diff !== 0 && finalSplits.length > 0) {
        finalSplits[0].amount += diff;
      }
    }

    return Expense.create(groupId, payerId, amount, description, splitType, finalSplits);
  }
}

module.exports = ExpenseService;