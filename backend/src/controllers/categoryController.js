const categoryService = require('../services/categoryService');

const listByHousehold = async (req, res, next) => {
  try {
    const householdId = parseInt(req.params.householdId, 10);
    const categories = await categoryService.listByHousehold(householdId, req.user.id);
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const householdId = parseInt(req.params.householdId, 10);
    const categoryId = await categoryService.create(householdId, req.body.name, req.user.id);
    res.status(201).json({ categoryId });
  } catch (error) {
    next(error);
  }
};

module.exports = { listByHousehold, create };
