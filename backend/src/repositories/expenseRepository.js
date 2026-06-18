const pool = require("../config/db");

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT e.*, u.name AS payer_name, c.name AS category_name
     FROM expenses e 
     JOIN users u ON e.payer_id = u.id 
     LEFT JOIN categories c ON e.category_id = c.id
     WHERE e.id = ?`,
    [id],
  );
  return rows[0] || null;
};

const findAllByHouseholdId = async (householdId) => {
  const [rows] = await pool.query(
    `SELECT e.*, u.name AS payer_name, c.name AS category_name
     FROM expenses e 
     JOIN users u ON e.payer_id = u.id 
     LEFT JOIN categories c ON e.category_id = c.id
     WHERE e.household_id = ? 
     ORDER BY e.expense_date DESC, e.created_at DESC`,
    [householdId],
  );
  return rows;
};

{/* Pagination*/}

const countByHouseholdId = async (householdId) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM expenses WHERE household_id = ?",
    [householdId],
  );
  return rows[0].total;
};

const findAllByHouseholdIdPaginated = async (householdId, page, limit) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT e.*, u.name AS payer_name, c.name AS category_name
     FROM expenses e 
     JOIN users u ON e.payer_id = u.id 
     LEFT JOIN categories c ON e.category_id = c.id
     WHERE e.household_id = ? 
     ORDER BY e.expense_date DESC, e.created_at DESC
     LIMIT ? OFFSET ?`,
    [householdId, limit, offset],
  );
  return rows;
};

const findSplitsByExpenseId = async (expenseId) => {
  const [rows] = await pool.query(
    `SELECT es.*, u.name AS member_name 
     FROM expense_splits es 
     JOIN users u ON es.member_id = u.id 
     WHERE es.expense_id = ?`,
    [expenseId],
  );
  return rows;
};

const deleteById = async (id) => {
  await pool.query("DELETE FROM expenses WHERE id = ?", [id]);
};

module.exports = {
  findById,
  findAllByHouseholdId,
  countByHouseholdId,
  findAllByHouseholdIdPaginated,
  findSplitsByExpenseId,
  deleteById,
};
