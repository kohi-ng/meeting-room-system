const User = require('./User');
const Room = require('./Room');
const Meeting = require('./Meeting');
const MeetingParticipant = require('./MeetingParticipant');

// Relationships

// User - Meeting (Organizer)
User.hasMany(Meeting, { foreignKey: 'organizerId', as: 'organizedMeetings' });
Meeting.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// User - Meeting (Secretary)
User.hasMany(Meeting, { foreignKey: 'secretaryId', as: 'secretaryMeetings' });
Meeting.belongsTo(User, { foreignKey: 'secretaryId', as: 'secretary' });

// Room - Meeting
Room.hasMany(Meeting, { foreignKey: 'roomId', as: 'meetings' });
Meeting.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

// Meeting - Participants (Many-to-Many through MeetingParticipant)
Meeting.belongsToMany(User, { 
  through: MeetingParticipant, 
  foreignKey: 'meetingId',
  otherKey: 'userId',
  as: 'participants'
});

User.belongsToMany(Meeting, { 
  through: MeetingParticipant, 
  foreignKey: 'userId',
  otherKey: 'meetingId',
  as: 'meetings'
});

// Direct associations for easier querying
Meeting.hasMany(MeetingParticipant, { foreignKey: 'meetingId', as: 'participantDetails' });
MeetingParticipant.belongsTo(Meeting, { foreignKey: 'meetingId' });
MeetingParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Room,
  Meeting,
  MeetingParticipant
};