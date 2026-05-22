const pool = require("../config/db");

const create = async (name, description, ownerId) => {
  const [result] = await pool.query(
    "INSERT INTO households (name, description, owner_id) VALUES (?, ?, ?)",
    [name, description, ownerId],
  );
  return result.insertId;
};

const addMember = async (householdId, userId, role) => {
  await pool.query(
    "INSERT INTO household_members (household_id, user_id, role) VALUES (?, ?, ?)",
    [householdId, userId, role],
  );
};

const findById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM households WHERE id = ?", [
    id,
  ]);
  return rows[0] || null;
};

const findAllByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT h.* FROM households h
     JOIN household_members hm ON h.id = hm.household_id
     WHERE hm.user_id = ?
     ORDER BY h.created_at DESC`,
    [userId],
  );
  return rows;
};

const findMembersByHouseholdId = async (householdId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, hm.role, hm.joined_at
     FROM household_members hm
     JOIN users u ON hm.user_id = u.id
     WHERE hm.household_id = ?`,
    [householdId],
  );
  return rows;
};

const isMember = async (householdId, userId) => {
  const [rows] = await pool.query(
    "SELECT 1 FROM household_members WHERE household_id = ? AND user_id = ?",
    [householdId, userId],
  );
  return rows.length > 0;
};

module.exports = {
  create,
  addMember,
  findById,
  findAllByUserId,
  findMembersByHouseholdId,
  isMember,
};
