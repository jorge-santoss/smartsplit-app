const app = require('./app');
const pool = require('/config/db');
const { port } = require('./config/env');

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    app.listen(port, () => {
      console.log(`Smartsplit backend running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
};

startServer();