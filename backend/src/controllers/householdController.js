const householdService = require("../services/householdService");

const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const householdId = await householdService.create(
      name,
      description,
      req.user.id,
    );
    res.status(201).json({ householdId });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const households = await householdService.listByUser(req.user.id);
    res.status(200).json(households);
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
    res.status(200).json(household);
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const user = await householdService.addMember(
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

const update = async (req, res, next) => {
  try {
    await householdService.update(
      parseInt(req.params.id, 10),
      req.body,
      req.user.id,
    );
    res.status(200).json({ message: "Household updated" });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await householdService.remove(
      parseInt(req.params.id, 10),
      req.user.id,
    );
    res.status(200).json({ message: 'Household deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, list, getById, addMember, update, remove };
