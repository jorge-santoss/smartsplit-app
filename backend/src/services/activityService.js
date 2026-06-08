const activityRepository = require('../repositories/activityRepository');

const getFeed = async (userId) => {
  const items = await activityRepository.findAllByUserId(userId);
  return items;
};

module.exports = { getFeed };
