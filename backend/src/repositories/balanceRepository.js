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

module.exports = { findAllByHouseholdId };
