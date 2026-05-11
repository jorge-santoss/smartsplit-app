const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');
const env = require('../config/env');

const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;

    if(!header || !header.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
    }

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, env.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        throw new UnauthorizedError('Invalid or expired token');
    }
};

module.exports = authMiddleware;