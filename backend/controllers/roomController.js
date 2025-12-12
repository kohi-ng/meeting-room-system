const { Room, Meeting } = require('../models');
const { Op } = require('sequelize');

exports.createRoom = async (req, res) => {
  try {
    const { name, capacity, location, description, equipment } = req.body;

    const existingRoom = await Room.findOne({ where: { name } });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Phòng họp đã tồn tại'
      });
    }

    const room = await Room.create({
      name,
      capacity,
      location,
      description,
      equipment
    });

    res.status(201).json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Create room error:', error.stack || error);
    console.error('Request body:', req.body);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Lỗi khi tạo phòng họp'
    });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const { isActive } = req.query;
    const where = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const rooms = await Room.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phòng họp'
    });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng họp'
      });
    }

    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin phòng họp'
    });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng họp'
      });
    }

    const { name, capacity, location, description, equipment, isActive } = req.body;

    if (name && name !== room.name) {
      const existingRoom = await Room.findOne({ where: { name } });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'Tên phòng họp đã tồn tại'
        });
      }
    }

    await room.update({
      name: name || room.name,
      capacity: capacity || room.capacity,
      location: location !== undefined ? location : room.location,
      description: description !== undefined ? description : room.description,
      equipment: equipment !== undefined ? equipment : room.equipment,
      isActive: isActive !== undefined ? isActive : room.isActive
    });

    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật phòng họp'
    });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng họp'
      });
    }

    // Check if room has future meetings
    const futureMeetings = await Meeting.count({
      where: {
        roomId: room.id,
        startTime: { [Op.gte]: new Date() },
        status: { [Op.in]: ['scheduled', 'ongoing'] }
      }
    });

    if (futureMeetings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa phòng họp có lịch hẹn trong tương lai'
      });
    }

    await room.destroy();

    res.json({
      success: true,
      message: 'Đã xóa phòng họp'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa phòng họp'
    });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { roomId, startTime, endTime, excludeMeetingId } = req.query;

    if (!roomId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin kiểm tra'
      });
    }

    const where = {
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
    };

    if (excludeMeetingId) {
      where.id = { [Op.ne]: excludeMeetingId };
    }

    const conflictingMeetings = await Meeting.findAll({ where });

    res.json({
      success: true,
      isAvailable: conflictingMeetings.length === 0,
      conflictingMeetings
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra phòng trống'
    });
  }
};