const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

class BalanceService {
  static getBalances(groupId, mode = 'PAIRWISE') {
    const expenses = Expense.findByGroupId(groupId);
    const settlements = Settlement.findByGroupId(groupId);
    
    // 1. Calculate Net Balances
    const net = {}; 
    const update = (uid, amt) => net[uid] = (net[uid] || 0) + amt;

    expenses.forEach(e => {
      e.splits.forEach(s => {
        if (s.user_id !== e.payer_id) {
          update(s.user_id, -s.amount); // Debtor loses
          update(e.payer_id, s.amount); // Payer gains
        }
      });
    });

    settlements.forEach(s => {
      update(s.payer_id, s.amount); // Payer cleared debt
      update(s.payee_id, -s.amount); // Payee received
    });

    if (mode === 'SIMPLIFY') return this.simplifyGraph(net);
    return this.pairwiseNetting(expenses, settlements);
  }

  // PHONEPE STYLE: Keep A->B distinct from B->C
  static pairwiseNetting(expenses, settlements) {
    const balances = {}; // [from][to] = amount
    const ensure = (u1, u2) => { if (!balances[u1]) balances[u1]={}; if(!balances[u1][u2]) balances[u1][u2]=0; };

    expenses.forEach(e => e.splits.forEach(s => {
      if (s.user_id !== e.payer_id) {
        ensure(s.user_id, e.payer_id);
        balances[s.user_id][e.payer_id] += s.amount;
      }
    }));

    settlements.forEach(s => {
      ensure(s.payer_id, s.payee_id);
      balances[s.payer_id][s.payee_id] -= s.amount;
    });

    const result = [];
    const seen = new Set();
    
    Object.keys(balances).forEach(a => {
      Object.keys(balances[a]).forEach(b => {
        const key = [a, b].sort().join('-');
        if (seen.has(key)) return;
        
        const debtAB = balances[a]?.[b] || 0;
        const debtBA = balances[b]?.[a] || 0;
        const net = debtAB - debtBA;

        if (net > 0) result.push({ from: +a, to: +b, amount: net });
        else if (net < 0) result.push({ from: +b, to: +a, amount: -net });
        
        seen.add(key);
      });
    });
    return result;
  }

  // SPLITWISE STYLE: Minimize transaction count
  static simplifyGraph(netBalances) {
    let debtors = [], creditors = [];
    Object.entries(netBalances).forEach(([id, amt]) => {
      if (amt < -1) debtors.push({ id: +id, amount: amt });
      else if (amt > 1) creditors.push({ id: +id, amount: amt });
    });

    debtors.sort((a, b) => a.amount - b.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const result = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      let d = debtors[i], c = creditors[j];
      let amt = Math.min(Math.abs(d.amount), c.amount);

      result.push({ from: d.id, to: c.id, amount: amt });

      d.amount += amt;
      c.amount -= amt;

      if (Math.abs(d.amount) < 1) i++;
      if (c.amount < 1) j++;
    }
    return result;
  }
}

module.exports = BalanceService;