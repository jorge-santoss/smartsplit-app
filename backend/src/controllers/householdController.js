const householdService = require("../services/householdService");

const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const houiseholdId = await householdService.create(
      name,
      description,
      req.user.id,
    );
    res.status(201).json({ householdId });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const household = await householdService.getById(
      parseInt(req.params.id, 10),
      req.user.id,
    );
    res.status(200).json(householdId);
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const user = householdService.addMember(
      parseInt(req.params.id, 10),
      email,
      role || "member",
      req.user.id,
    );
    res
      .status(201)
      .json({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: role || "member",
      });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, list, getById, addMember };
