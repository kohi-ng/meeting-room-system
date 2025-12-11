const { Meeting, MeetingParticipant, User, Room } = require('../models');
const { Op } = require('sequelize');
const googleService = require('../services/googleService');
const emailService = require('../services/emailService');

exports.createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      roomId,
      secretaryId,
      startTime,
      endTime,
      participantIds
    } = req.body;

    // Check room availability
    const conflictingMeetings = await Meeting.findAll({
      where: {
        roomId,
        status: { [Op.in]: ['scheduled', 'ongoing'] },
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [new Date(startTime), new Date(endTime)]
            }
          },
          {
            endTime: {
              [Op.between]: [new Date(startTime), new Date(endTime)]
            }
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: new Date(startTime) } },
              { endTime: { [Op.gte]: new Date(endTime) } }
            ]
          }
        ]
      }
    });

    if (conflictingMeetings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Phòng họp đã được đặt trong khung giờ này'
      });
    }

    // Get room info
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng họp'
      });
    }

    // Create meeting
    const meeting = await Meeting.create({
      title,
      description,
      roomId,
      organizerId: req.user.id,
      secretaryId,
      startTime,
      endTime
    });

    // Add organizer as participant
    await MeetingParticipant.create({
      meetingId: meeting.id,
      userId: req.user.id,
      role: 'organizer',
      responseStatus: 'accepted'
    });

    // Add secretary if exists
    if (secretaryId) {
      await MeetingParticipant.create({
        meetingId: meeting.id,
        userId: secretaryId,
        role: 'secretary',
        responseStatus: 'needsAction'
      });
    }

    // Add other participants
    if (participantIds && participantIds.length > 0) {
      const participantRecords = participantIds
        .filter(id => id !== req.user.id && id !== secretaryId)
        .map(userId => ({
          meetingId: meeting.id,
          userId,
          role: 'participant',
          responseStatus: 'needsAction'
        }));

      await MeetingParticipant.bulkCreate(participantRecords);
    }

    // Get all participants for Google Calendar and email
    const allParticipantIds = [
      req.user.id,
      ...(secretaryId ? [secretaryId] : []),
      ...(participantIds || [])
    ];
    const uniqueParticipantIds = [...new Set(allParticipantIds)];
    
    const participants = await User.findAll({
      where: { id: { [Op.in]: uniqueParticipantIds } }
    });

    // Create Google Calendar event if organizer has Google tokens
    if (req.user.googleAccessToken && req.user.googleRefreshToken) {
      try {
        const eventData = {
          title,
          description,
          location: room.name,
          startTime,
          endTime,
          attendees: participants.map(p => ({ email: p.email }))
        };

        const calendarEvent = await googleService.createCalendarEvent(
          req.user.googleAccessToken,
          req.user.googleRefreshToken,
          eventData
        );

        meeting.googleCalendarEventId = calendarEvent.id;
        await meeting.save();
      } catch (error) {
        console.error('Google Calendar error:', error);
      }
    }

    // Send email notifications
    try {
      const secretary = secretaryId ? await User.findByPk(secretaryId) : null;
      const emailData = {
        title,
        description,
        startTime,
        endTime,
        roomName: room.name,
        organizerName: req.user.name,
        secretaryName: secretary?.name
      };

      for (const participant of participants) {
        if (participant.id !== req.user.id) {
          await emailService.sendMeetingInvitation(participant.email, emailData);
        }
      }
    } catch (error) {
      console.error('Email notification error:', error);
    }

    // Reload with associations
    await meeting.reload({
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'secretary', attributes: ['id', 'name', 'email'] },
        { model: Room, as: 'room' },
        {
          model: MeetingParticipant,
          as: 'participantDetails',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo cuộc họp'
    });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const { startDate, endDate, roomId, status, myMeetings } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.startTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (roomId) {
      where.roomId = roomId;
    }

    if (status) {
      where.status = status;
    }

    if (myMeetings === 'true') {
      const userMeetings = await MeetingParticipant.findAll({
        where: { userId: req.user.id },
        attributes: ['meetingId']
      });
      where.id = { [Op.in]: userMeetings.map(m => m.meetingId) };
    }

    const meetings = await Meeting.findAll({
      where,
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'secretary', attributes: ['id', 'name', 'email'] },
        { model: Room, as: 'room' },
        {
          model: MeetingParticipant,
          as: 'participantDetails',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
        }
      ],
      order: [['startTime', 'ASC']]
    });

    res.json({
      success: true,
      count: meetings.length,
      meetings
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách cuộc họp'
    });
  }
};

exports.getMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id, {
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'secretary', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Room, as: 'room' },
        {
          model: MeetingParticipant,
          as: 'participantDetails',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }]
        }
      ]
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc họp'
      });
    }

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin cuộc họp'
    });
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc họp'
      });
    }

    // Check permission (only organizer or secretary can update)
    if (meeting.organizerId !== req.user.id && meeting.secretaryId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật cuộc họp này'
      });
    }

    const {
      title,
      description,
      roomId,
      secretaryId,
      startTime,
      endTime,
      status,
      participantIds
    } = req.body;

    // If changing room or time, check availability
    if ((roomId && roomId !== meeting.roomId) || 
        (startTime && new Date(startTime).getTime() !== new Date(meeting.startTime).getTime()) ||
        (endTime && new Date(endTime).getTime() !== new Date(meeting.endTime).getTime())) {
      
      const checkRoomId = roomId || meeting.roomId;
      const checkStartTime = startTime || meeting.startTime;
      const checkEndTime = endTime || meeting.endTime;

      const conflictingMeetings = await Meeting.findAll({
        where: {
          id: { [Op.ne]: meeting.id },
          roomId: checkRoomId,
          status: { [Op.in]: ['scheduled', 'ongoing'] },
          [Op.or]: [
            {
              startTime: {
                [Op.between]: [new Date(checkStartTime), new Date(checkEndTime)]
              }
            },
            {
              endTime: {
                [Op.between]: [new Date(checkStartTime), new Date(checkEndTime)]
              }
            }
          ]
        }
      });

      if (conflictingMeetings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Phòng họp đã được đặt trong khung giờ này'
        });
      }
    }

    // Update meeting
    await meeting.update({
      title: title || meeting.title,
      description: description !== undefined ? description : meeting.description,
      roomId: roomId || meeting.roomId,
      secretaryId: secretaryId !== undefined ? secretaryId : meeting.secretaryId,
      startTime: startTime || meeting.startTime,
      endTime: endTime || meeting.endTime,
      status: status || meeting.status
    });

    // Update participants if provided
    if (participantIds) {
      await MeetingParticipant.destroy({ 
        where: { 
          meetingId: meeting.id,
          role: 'participant'
        } 
      });

      const participantRecords = participantIds
        .filter(id => id !== meeting.organizerId && id !== meeting.secretaryId)
        .map(userId => ({
          meetingId: meeting.id,
          userId,
          role: 'participant',
          responseStatus: 'needsAction'
        }));

      await MeetingParticipant.bulkCreate(participantRecords);
    }

    // Update Google Calendar if exists
    if (meeting.googleCalendarEventId) {
      const organizer = await User.findByPk(meeting.organizerId);
      if (organizer.googleAccessToken && organizer.googleRefreshToken) {
        try {
          const room = await Room.findByPk(meeting.roomId);
          const participants = await meeting.getParticipants();
          
          const eventData = {
            title: meeting.title,
            description: meeting.description,
            location: room.name,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            attendees: participants.map(p => ({ email: p.email }))
          };

          await googleService.updateCalendarEvent(
            organizer.googleAccessToken,
            organizer.googleRefreshToken,
            meeting.googleCalendarEventId,
            eventData
          );
        } catch (error) {
          console.error('Google Calendar update error:', error);
        }
      }
    }

    await meeting.reload({
      include: [
        { model: User, as: 'organizer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'secretary', attributes: ['id', 'name', 'email'] },
        { model: Room, as: 'room' },
        {
          model: MeetingParticipant,
          as: 'participantDetails',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật cuộc họp'
    });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc họp'
      });
    }

    if (meeting.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người tạo mới có thể xóa cuộc họp'
      });
    }

    // Delete from Google Calendar if exists
    if (meeting.googleCalendarEventId) {
      const organizer = await User.findByPk(meeting.organizerId);
      if (organizer.googleAccessToken && organizer.googleRefreshToken) {
        try {
          await googleService.deleteCalendarEvent(
            organizer.googleAccessToken,
            organizer.googleRefreshToken,
            meeting.googleCalendarEventId
          );
        } catch (error) {
          console.error('Google Calendar delete error:', error);
        }
      }
    }

    await meeting.destroy();

    res.json({
      success: true,
      message: 'Đã xóa cuộc họp'
    });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa cuộc họp'
    });
  }
};

exports.uploadMinutes = async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc họp'
      });
    }

    if (meeting.secretaryId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ thư ký mới có thể upload biên bản'
      });
    }

    const { fileUrl } = req.body;

    meeting.minutesFileUrl = fileUrl;
    await meeting.save();

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Upload minutes error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload biên bản'
    });
  }
};