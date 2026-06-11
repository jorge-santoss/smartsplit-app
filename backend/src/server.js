const app = require('./app');
const pool = require('./config/db');
const { port } = require('./config/env');

let server;

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    server = app.listen(port, () => {
      console.log(`Smartsplit backend running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await pool.end();
      console.log('Server and DB pool closed');
      process.exit(0);
    });
  } else {
    await pool.end();
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
