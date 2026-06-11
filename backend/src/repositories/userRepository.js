const pool = require("../config/db");

const create = async (name, email, passwordHash) => {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash],
  );
  return result.insertId;
};

const findByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, created_at FROM users where id = ?",
    [id],
  );
  return rows[0] || null;
};

const findByIdWithPassword = async (id) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] || null;
};

const updateProfile = async (id, name, email) => {
  await pool.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id],
  );
};

const updatePassword = async (id, passwordHash) => {
  await pool.query(
    "UPDATE users SET password_hash = ? WHERE id = ?",
    [passwordHash, id],
  );
};

const deleteById = async (id) => {
  await pool.query("DELETE FROM users WHERE id = ?", [id]);
};

module.exports = { create, findByEmail, findById, findByIdWithPassword, updateProfile, updatePassword, deleteById };