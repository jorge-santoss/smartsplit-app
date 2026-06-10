const { ValidationError } = require('../utils/errors');

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new ValidationError('Name is required'));
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return next(new ValidationError('Valid email is required'));
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return next(new ValidationError('Password must be at least 6 characters'));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    return next(new ValidationError('Email is required'));
  }

  if (!password || typeof password !== 'string') {
    return next(new ValidationError('Password is required'));
  }

  next();
};

module.exports = { validateRegister, validateLogin };