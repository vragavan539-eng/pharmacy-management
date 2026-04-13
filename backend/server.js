require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const mongoose   = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy_ai');
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests' } });
const aiLimiter      = rateLimit({ windowMs: 60 * 1000, max: 20,  message: { error: 'AI rate limit exceeded. Try again in a minute.' } });

app.use('/api/', generalLimiter);
app.use('/api/ai/', aiLimiter);

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/drugs',         require('./routes/drugs'));
app.use('/api/patients',      require('./routes/patients'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/billing',       require('./routes/billing'));
app.use('/api/inventory',     require('./routes/inventory'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/ai',            require('./routes/ai'));

app.get('/health', (req, res) => res.json({
  status: 'OK',
  timestamp: new Date().toISOString(),
  env: process.env.NODE_ENV,
}));



app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.stack || err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

const start = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 PharmAI backend running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();

module.exports = app;