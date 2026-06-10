require('dotenv').config();

const required = {
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
};

for (const [key, value] of Object.entries(required)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 4000,

    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || 'root',
        password: required.DB_PASSWORD,
        name: process.env.DB_NAME || 'smartsplit',
        poolLimit: parseInt(process.env.DB_POOL_LIMIT, 10) || 10,
    },

    jwt: {
        secret: required.JWT_SECRET,
        expireIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = env;
