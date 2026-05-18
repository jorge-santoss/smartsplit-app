const pool = require("../config/db");

const create = async (name, ElementInternals, passwordHash) => {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password-hash) VALUES (?, ?, ?)",
    [name, ElementInternals, passwordHash],
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

module.exports = { create, findByEmail, findById };
