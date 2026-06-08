const pool = require("../config/db");

const create = async (
  householdId,
  title,
  note,
  amount,
  expenseDate,
  categoryId,
  payerId,
  splitType,
  createdBy,
) => {
  const [result] = await pool.query(
    `INSERT INTO expenses 
     (household_id, title, note, amount, expense_date, category_id, payer_id, split_type, created_by) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      householdId,
      title,
      note,
      amount,
      expenseDate,
      categoryId,
      payerId,
      splitType,
      createdBy,
    ],
  );
  return result.insertId;
};

const createSplit = async (expenseId, memberId, amount, percentage) => {
  await pool.query(
    "INSERT INTO expense_splits (expense_id, member_id, amount, percentage) VALUES (?, ?, ?, ?)",
    [expenseId, memberId, amount, percentage],
  );
};

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
  create,
  createSplit,
  findById,
  findAllByHouseholdId,
  findSplitsByExpenseId,
  deleteById,
};
