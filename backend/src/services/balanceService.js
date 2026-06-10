const balanceRepository = require('../repositories/balanceRepository');
const householdRepository = require('../repositories/householdRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const getBalances = async (householdId, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) {
    throw new NotFoundError('Household not found');
  }

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) {
    throw new ForbiddenError('You are not a member of this household');
  }

  const { expenses, settlements } = await balanceRepository.findAllByHouseholdId(householdId);

  const balances = {};

  for (const split of expenses) {
    if (split.payer_id !== split.member_id) {
      balances[split.payer_id] = (balances[split.payer_id] || 0) + parseFloat(split.amount);
      balances[split.member_id] = (balances[split.member_id] || 0) - parseFloat(split.amount);
    }
  }

  for (const settlement of settlements) {
     balances[settlement.from_user_id] = (balances[settlement.from_user_id] || 0) + parseFloat(settlement.amount);
    balances[settlement.to_user_id] = (balances[settlement.to_user_id] || 0) - parseFloat(settlement.amount);
  }

  const members = await householdRepository.findMembersByHouseholdId(householdId);

  const summary = members.map((m) => ({
    userId: m.id,
    name: m.name,
    email: m.email,
    balance: balances[m.id] ? Math.round(balances[m.id] * 100) / 100 : 0,
  }));

  return summary;
};

const getSummary = async (userId) => {
  const summary = await balanceRepository.getSummary(userId);
  return summary;
};

module.exports = { getBalances, getSummary };
