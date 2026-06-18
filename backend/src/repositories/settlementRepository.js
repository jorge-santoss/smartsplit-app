const pool = require('../config/db');

const create = async (householdId, fromUserId, toUserId, amount, settlementDate, note, createdBy) => {
  const [result] = await pool.query(
    `INSERT INTO settlements 
     (household_id, from_user_id, to_user_id, amount, settlement_date, note, created_by) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [householdId, fromUserId, toUserId, amount, settlementDate, note, createdBy]
  );
  return result.insertId;
};

const findAllByHouseholdId = async (householdId) => {
  const [rows] = await pool.query(
    `SELECT s.*, fu.name AS from_user_name, tu.name AS to_user_name
     FROM settlements s
     JOIN users fu ON s.from_user_id = fu.id
     JOIN users tu ON s.to_user_id = tu.id
     WHERE s.household_id = ?
     ORDER BY s.settlement_date DESC, s.created_at DESC`,
    [householdId]
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT s.*, fu.name AS from_user_name, tu.name AS to_user_name
     FROM settlements s
     JOIN users fu ON s.from_user_id = fu.id
     JOIN users tu ON s.to_user_id = tu.id
     WHERE s.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const countByHouseholdId = async (householdId) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM settlements WHERE household_id = ?",
    [householdId]
  );
  return rows[0].total;
};

const findAllByHouseholdIdPaginated = async (householdId, page, limit) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT s.*, fu.name AS from_user_name, tu.name AS to_user_name
     FROM settlements s
     JOIN users fu ON s.from_user_id = fu.id
     JOIN users tu ON s.to_user_id = tu.id
     WHERE s.household_id = ?
     ORDER BY s.settlement_date DESC, s.created_at DESC
     LIMIT ? OFFSET ?`,
    [householdId, limit, offset]
  );
  return rows;
};

const deleteById = async (id) => {
  await pool.query("DELETE FROM settlements WHERE id = ?", [id]);
};

module.exports = { create, findAllByHouseholdId, findById, countByHouseholdId, findAllByHouseholdIdPaginated, deleteById };