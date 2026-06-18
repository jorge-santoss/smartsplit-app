const activityService = require('../services/activityService');

const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await activityService.getFeed(req.user.id, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getFeed };