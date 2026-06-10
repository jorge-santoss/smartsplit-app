const settlementRepository = require('../repositories/settlementRepository');
const householdRepository = require('../repositories/householdRepository');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

const create = async (householdId, data, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) {
    throw new NotFoundError('Household not found');
  }

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) {
    throw new ForbiddenError('You are not a member of this household');
  }

  const fromMember = await householdRepository.isMember(householdId, data.fromUserId);
  if (!fromMember) {
    throw new ValidationError('From user is not a member of this household');
  }

  const toMember = await householdRepository.isMember(householdId, data.toUserId);
  if (!toMember) {
    throw new ValidationError('To user is not a member of this household');
  }

  if (typeof data.amount !== 'number' || data.amount <= 0) {
    throw new ValidationError('Amount must be a positive number');
  }

  const settlementId = await settlementRepository.create(
    householdId,
    data.fromUserId,
    data.toUserId,
    data.amount,
    data.settlementDate,
    data.note || null,
    userId,
  );

  return settlementId;
};

const listByHousehold = async (householdId, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) {
    throw new NotFoundError('Household not found');
  }

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) {
    throw new ForbiddenError('You are not a member of this household');
  }

  return settlementRepository.findAllByHouseholdId(householdId);
};

const remove = async (settlementId, userId) => {
  const settlement = await settlementRepository.findById(settlementId);
  if (!settlement) {
    throw new NotFoundError('Settlement not found');
  }

  const member = await householdRepository.isMember(settlement.household_id, userId);
  if (!member) {
    throw new ForbiddenError('You are not a member of this household');
  }

  await settlementRepository.deleteById(settlementId);
};

module.exports = { create, listByHousehold, remove };