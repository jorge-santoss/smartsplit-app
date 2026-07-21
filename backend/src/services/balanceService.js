const balanceRepository = require("../repositories/balanceRepository");
const householdRepository = require("../repositories/householdRepository");
const { NotFoundError, ForbiddenError } = require("../utils/errors");

const getBalances = async (householdId, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) throw new NotFoundError("Household not found");

  const member = await householdRepository.isMember(householdId, userId);
  if (!member)
    throw new ForbiddenError("You are not a member of this household");

  const { expenses, settlements } =
    await balanceRepository.findAllByHouseholdId(householdId);
  const members =
    await householdRepository.findMembersByHouseholdId(householdId);
  const memberMap = {};
  members.forEach((m) => {
    memberMap[m.id] = m;
  });

  // Per-member accumulators
  const totals = {};
  members.forEach((m) => {
    totals[m.id] = { total_paid: 0, total_owed: 0, net: 0 };
  });

  // Sum expenses: payer paid full amount, each split member owes their split amount
  for (const row of expenses) {
    if (!totals[row.payer_id]) continue;
    totals[row.payer_id].total_paid += parseFloat(row.amount);
    if (totals[row.member_id]) {
      totals[row.member_id].total_owed += parseFloat(row.amount);
    }
  }

  // Adjust for settlements: from_user loses money, to_user gains money
  for (const s of settlements) {
    if (totals[s.from_user_id])
      totals[s.from_user_id].net += parseFloat(s.amount);
    if (totals[s.to_user_id]) totals[s.to_user_id].net -= parseFloat(s.amount);
  }

  // Compute net balance = total_paid - total_owed + settlement adjustments
  const balances = members.map((m) => {
    const t = totals[m.id];
    const net = Math.round((t.total_paid - t.total_owed + t.net) * 100) / 100;
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      total_paid: Math.round(t.total_paid * 100) / 100,
      total_owed: Math.round(t.total_owed * 100) / 100,
      net_balance: net,
    };
  });

  // Simplified debt calculation
  const debtors = balances
    .filter((b) => b.net_balance < -0.005)
    .map((b) => ({ ...b, net_balance: Math.abs(b.net_balance) }))
    .sort((a, b) => b.net_balance - a.net_balance);
  const creditors = balances
    .filter((b) => b.net_balance > 0.005)
    .sort((a, b) => b.net_balance - a.net_balance);

  const debts = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].net_balance, creditors[j].net_balance);
    debts.push({
      fromId: debtors[i].id,
      fromName: debtors[i].name,
      toId: creditors[j].id,
      toName: creditors[j].name,
      amount: Math.round(amount * 100) / 100,
    });
    debtors[i].net_balance -= amount;
    creditors[j].net_balance -= amount;
    if (debtors[i].net_balance < 0.005) i++;
    if (creditors[j].net_balance < 0.005) j++;
  }

  return { debts, balances };
};

const getSummary = async (userId) => {
  return await balanceRepository.getSummary(userId);
};

module.exports = { getBalances, getSummary };
