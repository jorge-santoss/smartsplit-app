const settlementService = require('../services/settlementService');

const create = async (req, res, next) => {
  try {
    const householdId = parseInt(req.params.householdId, 10);
    const settlementId = await settlementService.create(householdId, req.body, req.user.id);
    res.status(201).json({ settlementId });
  } catch (error) {
    next(error);
  }
};

const listByHousehold = async (req, res, next) => {
  try {
    const householdId = parseInt(req.params.householdId, 10);
    const settlements = await settlementService.listByHousehold(householdId, req.user.id);
    res.status(200).json(settlements);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const settlementId = parseInt(req.params.id, 10);
    await settlementService.remove(settlementId, req.user.id);
    res.status(200).json({ message: 'Settlement deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, listByHousehold, remove };