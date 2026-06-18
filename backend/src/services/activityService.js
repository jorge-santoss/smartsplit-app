const activityRepository = require('../repositories/activityRepository');

const getFeed = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const total = await activityRepository.countAllByUserId(userId);
  const items = await activityRepository.findAllByUserId(userId, limit, offset);
  return { data: items, total, page, totalPages: Math.ceil(total / limit) };
};

module.exports = { getFeed };