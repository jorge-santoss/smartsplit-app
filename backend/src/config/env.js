require ('dotenv').config();

const env = {
    port: process.env.PORT || 4000,

    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB.PORT, 10) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME || 'smartsplit',
        poolLimit: parseInt(process.env.DB_POOL_LIMIT, 10) || 10,
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expireIn: process.env.JWT_EXPIRE_IN || '7d',
    },

    corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = env;