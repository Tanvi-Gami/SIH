const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const companyRoutes = require('./routes/companyRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const programRoutes = require('./routes/programRoutes');
const documentRoutes = require('./routes/documentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Static file serving for uploaded documents (resumes, certificates, etc.)
app.use('/uploads', express.static(env.uploadDir));

// General rate limiting — generous for a demo, still a real guardrail.
app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false })
);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'sih-backend-express', time: new Date().toISOString() }));

const v1 = express.Router();
v1.use('/auth', authRoutes);
v1.use('/students', studentRoutes);
v1.use('/', opportunityRoutes); // /jobs, /internships, /my-opportunities
v1.use('/applications', applicationRoutes);
v1.use('/companies', companyRoutes);
v1.use('/faculty', facultyRoutes);
v1.use('/institutions', institutionRoutes);
v1.use('/programs', programRoutes);
v1.use('/documents', documentRoutes);
v1.use('/analytics', analyticsRoutes);
v1.use('/notifications', notificationRoutes);

app.use('/api/v1', v1);
app.use('/ai', aiRoutes); // matches spec's /ai/* namespace (resume/analyze, chat, recommendations, ...)

app.use(notFound);
app.use(errorHandler);

module.exports = app;
