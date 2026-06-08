const householdRepository = require('../repositories/householdRepository');
const userRepository = require('../repositories/userRepository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const create = async (name, description, ownerId) => {
  const householdId = await householdRepository.create(name, description, ownerId);
  await householdRepository.addMember(householdId, ownerId, 'owner');
  return householdId;
};

const listByUser = async (userId) => {
  return householdRepository.findAllByUserId(userId);
};

const getById = async (householdId, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) {
    throw new NotFoundError('Household not found');
  }

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) {
    throw new ForbiddenError('You are not a member of this household');
  }

  const members = await householdRepository.findMembersByHouseholdId(householdId);
  return { ...household, members };
};

const addMember = async (householdId, email, role, currentUserId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) {
    throw new NotFoundError('Household not found');
  }

  if (household.owner_id !== currentUserId) {
    throw new ForbiddenError('Only the owner can add members');
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new NotFoundError('User with this email not found');
  }

  const alreadyMember = await householdRepository.isMember(householdId, user.id);
  if (alreadyMember) {
    throw new NotFoundError('User is already a member');
  }

  await householdRepository.addMember(householdId, user.id, role);
  return user;
};

const remove = async (householdId, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) {
    throw new NotFoundError('Household not found');
  }

  if (household.owner_id !== userId) {
    throw new ForbiddenError('Only the owner can delete the household');
  }

  await householdRepository.deleteById(householdId);
};

module.exports = { create, listByUser, getById, addMember, remove };