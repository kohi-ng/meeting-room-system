const { Room } = require('../models');

const roomsData = [];
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

async function seedIfEmpty() {
  try {
    const count = await Room.count();
    if (count === 0) {
      await Room.bulkCreate(roomsData);
      console.log(`✅ Seeded ${roomsData.length} rooms`);
    } else {
      console.log(`⚠️  Rooms already exist (${count}), skipping seed`);
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
}

module.exports = { seedIfEmpty };