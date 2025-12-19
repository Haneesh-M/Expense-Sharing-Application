const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

class BalanceService {
  static getGroupBalances(groupId) {
    const expenses = Expense.findByGroupId(groupId);
    const settlements = Settlement.findByGroupId(groupId);
    
    const balances = {}; // balances[from][to] = amount

    const ensureEntry = (u1, u2) => {
      if (!balances[u1]) balances[u1] = {};
      if (!balances[u1][u2]) balances[u1][u2] = 0;
    };

    // 1. Process Expenses
    expenses.forEach(exp => {
      const payer = exp.payer_id;
      exp.splits.forEach(split => {
        const debtor = split.user_id;
        if (debtor !== payer) {
          ensureEntry(debtor, payer);
          balances[debtor][payer] += split.amount;
        }
      });
    });

    // 2. Process Settlements
    settlements.forEach(settle => {
      ensureEntry(settle.payer_id, settle.payee_id);
      balances[settle.payer_id][settle.payee_id] -= settle.amount;
    });

    // 3. Pairwise Netting (PhonePe Style)
    const simplified = [];
    const processedPairs = new Set();

    Object.keys(balances).forEach(userA => {
      Object.keys(balances[userA]).forEach(userB => {
        const pairKey = [userA, userB].sort().join('-');
        if (processedPairs.has(pairKey)) return;

        const uA = parseInt(userA);
        const uB = parseInt(userB);

        let debtAB = balances[uA]?.[uB] || 0;
        let debtBA = balances[uB]?.[uA] || 0;

        if (debtAB > debtBA) {
          simplified.push({ from: uA, to: uB, amount: debtAB - debtBA });
        } else if (debtBA > debtAB) {
          simplified.push({ from: uB, to: uA, amount: debtBA - debtAB });
        }
        
        processedPairs.add(pairKey);
      });
    });

    return simplified;
  }

  static settleBalance(groupId, payerId, payeeId, amount) {
    return Settlement.create(groupId, payerId, payeeId, amount);
  }
}

module.exports = BalanceService;