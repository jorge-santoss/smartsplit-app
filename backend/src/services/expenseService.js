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

  if (data.splitType === "equal") {
    const splitAmount = parseFloat((data.amount / memberIds.length).toFixed(2));
    const remainder = parseFloat(
      (data.amount - splitAmount * memberIds.length).toFixed(2),
    );

    const expenseId = await expenseRepository.create(
      householdId,
      data.title,
      data.note || null,
      data.amount,
      data.expenseDate,
      data.categoryId || null,
      data.payerId,
      data.splitType,
      userId,
    );

    for (let i = 0; i < memberIds.length; i++) {
      const amount = i === 0 ? splitAmount + remainder : splitAmount;
      const percentage = parseFloat(((amount / data.amount) * 100).toFixed(2));
      await expenseRepository.createSplit(
        expenseId,
        memberIds[i],
        amount,
        percentage,
      );
    }

    return expenseId;
  }

  const expenseId = await expenseRepository.create(
    householdId,
    data.title,
    data.note || null,
    data.amount,
    data.expenseDate,
    data.categoryId || null,
    data.payerId,
    data.splitType,
    userId,
  );

  for (const split of data.splits) {
    const percentage =
      data.splitType === "exact"
        ? parseFloat(((split.amount / data.amount) * 100).toFixed(2))
        : split.percentage;
    await expenseRepository.createSplit(
      expenseId,
      split.memberId,
      split.amount,
      percentage,
    );
  }

  return expenseId;
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

  const expenses = await expenseRepository.findAllByHouseholdId(householdId);
  return expenses;
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

  await expenseRepository.deleteById(expenseId);
};

module.exports = { create, listByHousehold, getById, remove };
