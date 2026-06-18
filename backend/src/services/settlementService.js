const pool = require('../config/db');
const householdRepository = require('../repositories/householdRepository');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');
const settlementRepository = require('../repositories/settlementRepository');

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

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO settlements 
       (household_id, from_user_id, to_user_id, amount, settlement_date, note, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [householdId, data.fromUserId, data.toUserId, data.amount, data.settlementDate, data.note || null, userId]
    );

    await conn.commit();
    return result.insertId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const listByHousehold = async (householdId, userId, page = 1, limit = 10) => {
  const household = await householdRepository.findById(householdId);
  if (!household) {
    throw new NotFoundError('Household not found');
  }

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) {
    throw new ForbiddenError('You are not a member of this household');
  }

  const total = await settlementRepository.countByHouseholdId(householdId);
  const settlements = await settlementRepository.findAllByHouseholdIdPaginated(householdId, page, limit);

  return { data: settlements, total, page, totalPages: Math.ceil(total / limit) };
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