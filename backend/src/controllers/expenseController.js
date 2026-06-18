const expenseService = require('../services/expenseService');

const create = async (req, res, next) => {
  try {
    const householdId = parseInt(req.params.householdId, 10);
    const expenseId = await expenseService.create(householdId, req.body, req.user.id);
    res.status(201).json({ expenseId });
  } catch (error) {
    next(error);
  }
};

const listByHousehold = async (req, res, next) => {
  try {
    const householdId = parseInt(req.params.householdId, 10);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await expenseService.listByHousehold(householdId, req.user.id, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const expenseId = parseInt(req.params.id, 10);
    const expense = await expenseService.getById(expenseId, req.user.id);
    res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const expenseId = parseInt(req.params.id, 10);
    await expenseService.update(expenseId, req.body, req.user.id);
    res.status(200).json({ message: "Expense updated" });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const expenseId = parseInt(req.params.id, 10);
    await expenseService.remove(expenseId, req.user.id);
    res.status(200).json({ message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, listByHousehold, getById, update, remove };