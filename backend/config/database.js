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
  // Fallback to file-based SQLite for local development (persistent)
  const storagePath = path.join(__dirname, '../../meeting_room.db');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
  console.log(`💾 Using SQLite file at ${storagePath}`);
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