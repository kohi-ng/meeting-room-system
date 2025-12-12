// backend/seeds/seed-rooms.js
// Run: node backend/seeds/seed-rooms.js

require('dotenv').config();
const { Room } = require('../models');
const sequelize = require('../config/database');

const roomsData = [];

// Building A - Floor 1 (A101-A125)
for (let i = 101; i <= 125; i++) {
  roomsData.push({
    name: `A${i}`,
    capacity: 25,
    location: `Building A - Floor 1`,
    description: `Meeting room A${i} - Floor 1, suitable for team meetings`,
    equipment: ['Projector', 'Whiteboard', 'TV Screen', 'Air Conditioning'],
    isActive: true
  });
}

// Building A - Floor 2 (A201-A225)
for (let i = 201; i <= 225; i++) {
  roomsData.push({
    name: `A${i}`,
    capacity: 20,
    location: `Building A - Floor 2`,
    description: `Meeting room A${i} - Floor 2, equipped with computers`,
    equipment: ['Computers', 'Projector', 'Whiteboard', 'Air Conditioning'],
    isActive: true
  });
}

// Building B - Floor 1 (B101-B125)
for (let i = 101; i <= 125; i++) {
  roomsData.push({
    name: `B${i}`,
    capacity: 50,
    location: `Building B - Floor 1`,
    description: `Large meeting room B${i} - Floor 1, suitable for presentations`,
    equipment: ['Whiteboard', 'Sound System', 'Projector', 'Air Conditioning'],
    isActive: true
  });
}

// Building B - Floor 2 (B201-B225)
for (let i = 201; i <= 225; i++) {
  roomsData.push({
    name: `B${i}`,
    capacity: 30,
    location: `Building B - Floor 2`,
    description: `Smart room B${i} - Floor 2, equipped with touchable board`,
    equipment: ['Touchable Board', 'Video Conference System', 'Projector', 'Air Conditioning'],
    isActive: true
  });
}

async function seedRooms() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if rooms already exist
    const existingCount = await Room.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing rooms`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('Delete existing rooms and reseed? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes') {
          await Room.destroy({ where: {}, truncate: true });
          console.log('🗑️  Deleted existing rooms');
          await insertRooms();
        } else {
          console.log('❌ Seed cancelled');
        }
        readline.close();
        process.exit(0);
      });
    } else {
      await insertRooms();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

async function insertRooms() {
  try {
    await Room.bulkCreate(roomsData);
    console.log(`✅ Successfully seeded ${roomsData.length} rooms`);
    console.log('\nRoom breakdown:');
    console.log('  • Building A - Floor 1 (A101-A125): 25 rooms, 25 capacity, Projector');
    console.log('  • Building A - Floor 2 (A201-A225): 25 rooms, 20 capacity, Computers');
    console.log('  • Building B - Floor 1 (B101-B125): 25 rooms, 50 capacity, Whiteboard');
    console.log('  • Building B - Floor 2 (B201-B225): 25 rooms, 30 capacity, Touchable Board');
    console.log('\n🎉 Total: 100 rooms created!');
  } catch (error) {
    console.error('❌ Insert error:', error);
  }
}

seedRooms();