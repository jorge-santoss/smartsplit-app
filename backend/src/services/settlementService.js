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
    throw new ValidationError('Payer is not a member of this household');
  }

  const toMember = await householdRepository.isMember(householdId, data.toUserId);
  if (!toMember) {
    throw new ValidationError('Receiver is not a member of this household');
  }

  if (data.fromUserId === data.toUserId) {
    throw new ValidationError('Cannot settle with yourself');
  }

  if (data.amount <= 0) {
    throw new ValidationError('Amount must be greater than zero');
  }

  const settlementId = await settlementRepository.create(
    householdId, data.fromUserId, data.toUserId, data.amount,
    data.settlementDate, data.note || null, userId
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

module.exports = { create, listByHousehold };