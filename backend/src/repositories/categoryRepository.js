const pool = require("../config/db");

const create = async (householdId, name, createdBy) => {
  const [result] = await pool.query(
    "INSERT INTO categories (household_id, name, created_by) VALUES (?, ?, ?)",
    [householdId, name, createdBy],
  );
  return result.insertId;
};

const findAllByHouseholdId = async (householdId) => {
  const [rows] = await pool.query(
    "SELECT * FROM categories WHERE household_id = ? ORDER BY name",
    [householdId],
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
  return rows[0] || null;
};

const update = async (id, name) => {
  await pool.query("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
};

const deleteById = async (id) => {
  await pool.query("DELETE FROM categories WHERE id = ?", [id]);
};

module.exports = { create, findAllByHouseholdId, findById, update, deleteById };