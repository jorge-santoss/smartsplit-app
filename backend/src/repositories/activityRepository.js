const pool = require('../config/db');

const countAllByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM (
      SELECT e.id FROM expenses e
      JOIN households h ON e.household_id = h.id
      JOIN household_members hm ON h.id = hm.household_id AND hm.user_id = ?
      UNION ALL
      SELECT hm.user_id FROM household_members hm
      JOIN households h ON hm.household_id = h.id
      WHERE hm.household_id IN (SELECT household_id FROM household_members WHERE user_id = ?)
      UNION ALL
      SELECT s.id FROM settlements s
      JOIN households h ON s.household_id = h.id
      JOIN household_members hm ON h.id = hm.household_id AND hm.user_id = ?
    ) AS feed`,
    [userId, userId, userId]
  );
  return rows[0].total;
};

const findAllByUserId = async (userId, limit = 20, offset = 0) => {
  const [rows] = await pool.query(
    `SELECT 'expense' AS type, e.id AS item_id, e.title AS label, e.amount, h.name AS household_name, e.created_at
     FROM expenses e
     JOIN households h ON e.household_id = h.id
     JOIN household_members hm ON h.id = hm.household_id AND hm.user_id = ?
     UNION ALL
     SELECT 'member' AS type, hm.user_id AS item_id, u.name AS label, NULL AS amount, h.name AS household_name, hm.joined_at AS created_at
     FROM household_members hm
     JOIN households h ON hm.household_id = h.id
     JOIN users u ON hm.user_id = u.id
     WHERE hm.household_id IN (SELECT household_id FROM household_members WHERE user_id = ?)
     UNION ALL
     SELECT 'settlement' AS type, s.id AS item_id, CONCAT(fu.name, ' → ', tu.name) AS label, s.amount, h.name AS household_name, s.created_at
     FROM settlements s
     JOIN households h ON s.household_id = h.id
     JOIN household_members hm ON h.id = hm.household_id AND hm.user_id = ?
     JOIN users fu ON s.from_user_id = fu.id
     JOIN users tu ON s.to_user_id = tu.id
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, userId, userId, limit, offset]
  );
  return rows;
};

module.exports = { countAllByUserId, findAllByUserId };