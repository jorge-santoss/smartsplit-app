const express = require('express');
const cors = require('cors');
const { corsOrigin } = require('./config/env');
const authMiddleware = require('./middleware/authMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const householdRoutes = require('./routes/householdRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

const corsOptions =
  corsOrigin === '*'
    ? {}
    : {
        origin: corsOrigin.split(',').map((origin) => origin.trim()),
      };

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/households', expenseRoutes);
app.use('/api/households', settlementRoutes);
app.use('/api/households', balanceRoutes);
app.use('/api/households', categoryRoutes);
app.use('/api', activityRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;