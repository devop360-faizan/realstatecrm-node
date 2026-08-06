const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const errorHandler = require('./middlewares/errorHandler.middleware');
const apiRoutes = require('./routes/index');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api', apiRoutes);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'RealEstate CRM API is active ✅' });
});

app.use(errorHandler);

module.exports = app;
