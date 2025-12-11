const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MeetingParticipant = sequelize.define('MeetingParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  meetingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Meetings',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('organizer', 'secretary', 'participant'),
    defaultValue: 'participant'
  },
  responseStatus: {
    type: DataTypes.ENUM('accepted', 'declined', 'tentative', 'needsAction'),
    defaultValue: 'needsAction'
  },
  notified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['meetingId', 'userId']
    }
  ]
});

module.exports = MeetingParticipant;