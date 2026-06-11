const pool = require("../config/db");
const expenseRepository = require("../repositories/expenseRepository");
const householdRepository = require("../repositories/householdRepository");
const {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} = require("../utils/errors");

const create = async (householdId, data, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) {
    throw new NotFoundError("Household not found");
  }

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) {
    throw new ForbiddenError("You are not a member of this household");
  }

  const members =
    await householdRepository.findMembersByHouseholdId(householdId);
  const memberIds = members.map((m) => m.id);

  if (!memberIds.includes(data.payerId)) {
    throw new ValidationError("Payer must be a household member");
  }

  if (data.amount <= 0) {
    throw new ValidationError("Amount must be greater than zero");
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO expenses 
       (household_id, title, note, amount, expense_date, category_id, payer_id, split_type, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        householdId,
        data.title,
        data.note || null,
        data.amount,
        data.expenseDate,
        data.categoryId || null,
        data.payerId,
        data.splitType,
        userId,
      ],
    );
    const expenseId = result.insertId;

    if (data.splitType === "equal") {
      const splitAmount = parseFloat((data.amount / memberIds.length).toFixed(2));
      const remainder = parseFloat(
        (data.amount - splitAmount * memberIds.length).toFixed(2),
      );

      for (let i = 0; i < memberIds.length; i++) {
        const amount = i === 0 ? splitAmount + remainder : splitAmount;
        const percentage = parseFloat(((amount / data.amount) * 100).toFixed(2));
        await conn.query(
          "INSERT INTO expense_splits (expense_id, member_id, amount, percentage) VALUES (?, ?, ?, ?)",
          [expenseId, memberIds[i], amount, percentage],
        );
      }
    } else {
      if (!Array.isArray(data.splits) || data.splits.length === 0) {
        throw new ValidationError("Splits are required for this split type");
      }

      for (const split of data.splits) {
        if (!memberIds.includes(split.memberId)) {
          throw new ValidationError("Each split member must be part of the household");
        }
        if (split.amount !== undefined && split.amount < 0) {
          throw new ValidationError("Split amounts cannot be negative");
        }
        if (split.percentage !== undefined && (split.percentage < 0 || split.percentage > 100)) {
          throw new ValidationError("Split percentages must be between 0 and 100");
        }
      }

      if (data.splitType === "exact") {
        const totalSplit = data.splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
        if (Math.abs(totalSplit - data.amount) > 0.01) {
          throw new ValidationError("Split amounts must add up to the total expense amount");
        }
      }

      if (data.splitType === "percentage") {
        const totalPct = data.splits.reduce((sum, s) => sum + (parseFloat(s.percentage) || 0), 0);
        if (Math.abs(totalPct - 100) > 0.01) {
          throw new ValidationError("Split percentages must add up to 100");
        }
      }

      for (const split of data.splits) {
        const pct =
          data.splitType === "exact"
            ? parseFloat(((split.amount / data.amount) * 100).toFixed(2))
            : split.percentage;
        await conn.query(
          "INSERT INTO expense_splits (expense_id, member_id, amount, percentage) VALUES (?, ?, ?, ?)",
          [expenseId, split.memberId, split.amount, pct],
        );
      }
    }

    await conn.commit();
    return expenseId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const listByHousehold = async (householdId, userId) => {
  const household = await householdRepository.findById(householdId);
  if (!household) {
    throw new NotFoundError("Household not found");
  }

  const member = await householdRepository.isMember(householdId, userId);
  if (!member) {
    throw new ForbiddenError("You are not a member of this household");
  }

  return expenseRepository.findAllByHouseholdId(householdId);
};

const getById = async (expenseId, userId) => {
  const expense = await expenseRepository.findById(expenseId);
  if (!expense) {
    throw new NotFoundError("Expense not found");
  }

  const member = await householdRepository.isMember(
    expense.household_id,
    userId,
  );
  if (!member) {
    throw new ForbiddenError("You are not a member of this household");
  }

  const splits = await expenseRepository.findSplitsByExpenseId(expenseId);
  return { ...expense, splits };
};


const update = async (expenseId, data, userId) => {
  const expense = await expenseRepository.findById(expenseId);
  if (!expense) {
    throw new NotFoundError("Expense not found");
  }

  const member = await householdRepository.isMember(expense.household_id, userId);
  if (!member) {
    throw new ForbiddenError("You are not a member of this household");
  }
  if (expense.payer_id !== userId) {
    throw new ForbiddenError("Only the payer can edit this expense");
  }

  const members = await householdRepository.findMembersByHouseholdId(expense.household_id);
  const memberIds = members.map((m) => m.id);

  if (data.payerId && !memberIds.includes(data.payerId)) {
    throw new ValidationError("Payer must be a household member");
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE expenses 
       SET title = ?, note = ?, amount = ?, expense_date = ?, category_id = ?, payer_id = ?, split_type = ?
       WHERE id = ?`,
      [data.title, data.note || null, data.amount, data.expenseDate, data.categoryId || null, data.payerId, data.splitType, expenseId],
    );

    await conn.query("DELETE FROM expense_splits WHERE expense_id = ?", [expenseId]);

    if (data.splitType === "equal") {
      const splitAmount = parseFloat((data.amount / memberIds.length).toFixed(2));
      const remainder = parseFloat((data.amount - splitAmount * memberIds.length).toFixed(2));
      for (let i = 0; i < memberIds.length; i++) {
        const amount = i === 0 ? splitAmount + remainder : splitAmount;
        const percentage = parseFloat(((amount / data.amount) * 100).toFixed(2));
        await conn.query(
          "INSERT INTO expense_splits (expense_id, member_id, amount, percentage) VALUES (?, ?, ?, ?)",
          [expenseId, memberIds[i], amount, percentage],
        );
      }
    } else {
      if (!Array.isArray(data.splits) || data.splits.length === 0) {
        throw new ValidationError("Splits are required for this split type");
      }

      for (const split of data.splits) {
        if (!memberIds.includes(split.memberId)) {
          throw new ValidationError("Each split member must be part of the household");
        }
        if (split.amount !== undefined && split.amount < 0) {
          throw new ValidationError("Split amounts cannot be negative");
        }
        if (split.percentage !== undefined && (split.percentage < 0 || split.percentage > 100)) {
          throw new ValidationError("Split percentages must be between 0 and 100");
        }
      }

      if (data.splitType === "exact") {
        const totalSplit = data.splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
        if (Math.abs(totalSplit - data.amount) > 0.01) {
          throw new ValidationError("Split amounts must add up to the total expense amount");
        }
      }

      if (data.splitType === "percentage") {
        const totalPct = data.splits.reduce((sum, s) => sum + (parseFloat(s.percentage) || 0), 0);
        if (Math.abs(totalPct - 100) > 0.01) {
          throw new ValidationError("Split percentages must add up to 100");
        }
      }

      for (const split of data.splits) {
        const pct = data.splitType === "exact"
          ? parseFloat(((split.amount / data.amount) * 100).toFixed(2))
          : split.percentage;
        await conn.query(
          "INSERT INTO expense_splits (expense_id, member_id, amount, percentage) VALUES (?, ?, ?, ?)",
          [expenseId, split.memberId, split.amount, pct],
        );
      }
    }

    await conn.commit();
    return expenseId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

const remove = async (expenseId, userId) => {
  const expense = await expenseRepository.findById(expenseId);
  if (!expense) {
    throw new NotFoundError("Expense not found");
  }

  const member = await householdRepository.isMember(
    expense.household_id,
    userId,
  );
  if (!member) {
    throw new ForbiddenError("You are not a member of this household");
  }

  if (expense.payer_id !== userId) {
    throw new ForbiddenError("Only the payer can delete this expense");
  }

  await expenseRepository.deleteById(expenseId);
};

module.exports = { create, listByHousehold, getById, update, remove };
