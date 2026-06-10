const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const env = require('../config/env');
const { ValidationError, UnauthorizedError, NotFoundError } = require('../utils/errors');

const register = async (name, email, password) => {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
        throw new ValidationError('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = await userRepository.create(name, email, passwordHash);

    const token = jwt.sign({ id: userId, email, name }, env.jwt.secret, {
        expiresIn: env.jwt.expireIn,
    });

    return { userId, token };
};

const login = async (email, password) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        env.jwt.secret,
        { expiresIn: env.jwt.expireIn }
    );

    return { userId: user.id, token };
};

const getProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

const updateProfile = async (userId, name, email) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (email !== user.email) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ValidationError('Email already in use');
    }
  }

  await userRepository.updateProfile(userId, name, email);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findByIdWithPassword(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new ValidationError('Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await userRepository.updatePassword(userId, passwordHash);
};

module.exports = { register, login, getProfile, updateProfile, changePassword };