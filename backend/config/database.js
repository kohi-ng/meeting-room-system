const { Sequelize } = require('sequelize');
require('dotenv').config();
const path = require('path');

let sequelize;

// Check if DATABASE_URL có thật là PostgreSQL hay placeholder
const isValidPostgresUrl = process.env.DATABASE_URL && 
  process.env.DATABASE_URL.includes('postgresql') &&
  !process.env.DATABASE_URL.includes('YOUR_');

if (isValidPostgresUrl) {
  // Use PostgreSQL for production
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
  console.log('🗄️  Using PostgreSQL');
} else {
  // Fallback to in-memory SQLite for local development
  sequelize = new Sequelize('sqlite::memory:', {
    dialect: 'sqlite',
    logging: false
  });
  console.log('💾 Using in-memory SQLite (data will be lost on restart)');
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
  }
};

testConnection();

module.exports = sequelize;