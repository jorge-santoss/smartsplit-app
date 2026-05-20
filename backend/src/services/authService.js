const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const env = require('../config/env');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

const register = async (name, email, password) => {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
        throw new ValidationError('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = await userRepository.create(name, email, passwordHash);

    const token = jwt.sign({ id: userId, email }, env.jwt.secret, {
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
        {id: user.id, email: user.email},
        env.jwt.secret,
        { expiresIn: env.jwt.expireIn }
    );

    return { userId: user.id, token };
};

module.exports = { register, login };