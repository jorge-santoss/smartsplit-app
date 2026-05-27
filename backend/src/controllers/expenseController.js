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
    const expenses = await expenseService.listByHousehold(householdId, req.user.id);
    res.status(200).json(expenses);
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

module.exports = { create, listByHousehold, getById };