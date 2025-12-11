const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const authController = require('../controllers/authController');
const roomController = require('../controllers/roomController');
const meetingController = require('../controllers/meetingController');

// AUTH ROUTES
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/google', authController.googleAuthUrl);
router.get('/auth/google/callback', authController.googleCallback);
router.get('/auth/me', protect, authController.getMe);

// ROOM ROUTES
router.get('/rooms/check-availability', protect, roomController.checkAvailability);

router.route('/rooms')
  .get(protect, roomController.getRooms)
  .post(protect, authorize('admin'), roomController.createRoom);

router.route('/rooms/:id')
  .get(protect, roomController.getRoom)
  .put(protect, authorize('admin'), roomController.updateRoom)
  .delete(protect, authorize('admin'), roomController.deleteRoom);

// MEETING ROUTES
router.route('/meetings')
  .get(protect, meetingController.getMeetings)
  .post(protect, meetingController.createMeeting);

router.route('/meetings/:id')
  .get(protect, meetingController.getMeeting)
  .put(protect, meetingController.updateMeeting)
  .delete(protect, meetingController.deleteMeeting);

router.post('/meetings/:id/minutes', protect, meetingController.uploadMinutes);

// USER ROUTES (Get all users for adding participants)
router.get('/users', protect, async (req, res) => {
  try {
    const { User } = require('../models');
    const users = await User.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'email', 'avatar'],
      order: [['name', 'ASC']]
    });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách người dùng' });
  }
});

module.exports = router;