const pool = require('../config/db');

const findAllByHouseholdId = async (householdId) => {
  const [expenses] = await pool.query(
    `SELECT e.id, e.payer_id, es.member_id, es.amount
     FROM expenses e
     JOIN expense_splits es ON e.id = es.expense_id
     WHERE e.household_id = ?`,
    [householdId]
  );

  const [settlements] = await pool.query(
    `SELECT from_user_id, to_user_id, amount FROM settlements WHERE household_id = ?`,
    [householdId]
  );

  return { expenses, settlements };
};

const getSummary = async (userId) => {
  const [owedFromExpenses] = await pool.query(
    `SELECT COALESCE(SUM(es.amount), 0) AS total
     FROM expenses e
     JOIN expense_splits es ON e.id = es.expense_id
     WHERE e.payer_id = ? AND es.member_id != ?`,
    [userId, userId]
  );

  const [owedToOthers] = await pool.query(
    `SELECT COALESCE(SUM(es.amount), 0) AS total
     FROM expenses e
     JOIN expense_splits es ON e.id = es.expense_id
     WHERE e.payer_id != ? AND es.member_id = ?`,
    [userId, userId]
  );

  const [userPaidSettlements] = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM settlements WHERE from_user_id = ?`,
    [userId]
  );

  const [userReceivedSettlements] = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM settlements WHERE to_user_id = ?`,
    [userId]
  );

  const totalOwedToMe = owedFromExpenses[0].total - userReceivedSettlements[0].total;
  const totalIOwe = owedToOthers[0].total - userPaidSettlements[0].total;

  return {
    totalOwedToMe: Math.round(totalOwedToMe * 100) / 100,
    totalIOwe: Math.round(totalIOwe * 100) / 100,
  };
};

module.exports = { findAllByHouseholdId, getSummary };
