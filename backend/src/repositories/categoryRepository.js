const pool = require('../config/db');

const findAllByHouseholdId = async (householdId) => {
  const [rows] = await pool.query(
    'SELECT id, name FROM categories WHERE household_id = ? ORDER BY name',
    [householdId]
  );
  return rows;
};

const create = async (householdId, name, createdBy) => {
  const [result] = await pool.query(
    'INSERT INTO categories (household_id, name, created_by) VALUES (?, ?, ?)',
    [householdId, name, createdBy]
  );
  return result.insertId;
};

module.exports = { findAllByHouseholdId, create };
