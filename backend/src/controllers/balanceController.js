const balanceService = require('../services/balanceService');

const getBalances = async (req, res, next) => {
  try {
    const householdId = parseInt(req.params.householdId, 10);
    const balances = await balanceService.getBalances(householdId, req.user.id);
    res.status(200).json(balances);
  } catch (error) {
    next(error);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const summary = await balanceService.getSummary(req.user.id);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = { getBalances, getSummary };
