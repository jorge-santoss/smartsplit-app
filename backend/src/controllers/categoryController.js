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
    const { name } = req.body;
    const categoryId = await categoryService.create(householdId, name, req.user.id);
    res.status(201).json({ categoryId });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    const { name } = req.body;
    await categoryService.update(categoryId, name, req.user.id);
    res.status(200).json({ message: 'Category updated' });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    await categoryService.remove(categoryId, req.user.id);
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listByHousehold, create, update, remove };