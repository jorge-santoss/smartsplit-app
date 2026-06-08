const categoryRepository = require('../repositories/categoryRepository');
const householdRepository = require('../repositories/householdRepository');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

const listByHousehold = async (householdId, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) throw new NotFoundError('Household not found');

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) throw new ForbiddenError('You are not a member of this household');

  return categoryRepository.findAllByHouseholdId(householdId);
};

const create = async (householdId, name, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) throw new NotFoundError('Household not found');

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) throw new ForbiddenError('You are not a member of this household');

  if (!name || !name.trim()) throw new ValidationError('Category name is required');

  return categoryRepository.create(householdId, name.trim(), userId);
};

module.exports = { listByHousehold, create };
