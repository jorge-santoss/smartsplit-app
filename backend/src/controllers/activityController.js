const activityService = require('../services/activityService');

const getFeed = async (req, res, next) => {
  try {
    const items = await activityService.getFeed(req.user.id);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

module.exports = { getFeed };
