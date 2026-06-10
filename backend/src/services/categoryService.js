const categoryRepository = require('../repositories/categoryRepository');
const householdRepository = require('../repositories/householdRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const listByHousehold = async (householdId, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) {
    throw new NotFoundError('Household not found');
  }

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) {
    throw new ForbiddenError('You are not a member of this household');
  }

  return categoryRepository.findAllByHouseholdId(householdId);
};

const create = async (householdId, name, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) {
    throw new NotFoundError('Household not found');
  }

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) {
    throw new ForbiddenError('You are not a member of this household');
  }

  return categoryRepository.create(householdId, name, userId);
};

const update = async (categoryId, name, userId) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const member = await householdRepository.isMember(category.household_id, userId);
  if (!member) {
    throw new ForbiddenError('You are not a member of this household');
  }

  await categoryRepository.update(categoryId, name);
};

const remove = async (categoryId, userId) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const member = await householdRepository.isMember(category.household_id, userId);
  if (!member) {
    throw new ForbiddenError('You are not a member of this household');
  }

  await categoryRepository.deleteById(categoryId);
};

module.exports = { listByHousehold, create, update, remove };