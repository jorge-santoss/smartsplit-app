const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { corsOrigin } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const householdRoutes = require('./routes/householdRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

app.use(helmet());
app.use(morgan('dev'));

const corsOptions =
  corsOrigin === '*'
    ? {}
    : {
        origin: (corsOrigin || '').split(',').map((origin) => origin.trim()),
      };

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/households', householdRoutes);
app.use('/api', balanceRoutes);
app.use('/api/households', expenseRoutes);
app.use('/api/households', settlementRoutes);
app.use('/api/households', categoryRoutes);
app.use('/api', activityRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
