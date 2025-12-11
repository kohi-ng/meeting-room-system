const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// Sync database and start server
const startServer = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully');

    // Create default admin user if not exists
    const { User } = require('./models');
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      await User.create({
        email: 'admin@meetingroom.com',
        name: 'Administrator',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Default admin user created (admin@meetingroom.com / admin123)');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();