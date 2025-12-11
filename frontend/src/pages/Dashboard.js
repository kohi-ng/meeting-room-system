// ===============================================
// FILE: frontend/src/pages/Dashboard.js
// ===============================================
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { roomAPI, meetingAPI, userAPI } from '../services/api';
import {
  Container, Box, AppBar, Toolbar, Typography, Button,
  IconButton, Grid, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, Avatar, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Logout as LogoutIcon,
  Event as EventIcon,
  MeetingRoom as RoomIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

function Dashboard() {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    roomId: '',
    secretaryId: '',
    startTime: '',
    endTime: '',
    participantIds: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsRes, meetingsRes, usersRes] = await Promise.all([
        roomAPI.getAll({ isActive: true }),
        meetingAPI.getAll({ myMeetings: true }),
        userAPI.getAll()
      ]);
      setRooms(roomsRes.data.rooms || []);
      setMeetings(meetingsRes.data.meetings || []);
      setUsers(usersRes.data.users || []);
      setError('');
    } catch (error) {
      console.error('Load data error:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại!');
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      description: '',
      roomId: '',
      secretaryId: '',
      startTime: '',
      endTime: '',
      participantIds: []
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      await meetingAPI.create(formData);
      setSuccess('Đã tạo cuộc họp thành công!');
      loadData();
      setTimeout(() => {
        handleCloseDialog();
        setSuccess('');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Lỗi khi tạo cuộc họp');
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <EventIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Hệ Thống Đặt Lịch Phòng Họp
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar alt={user?.name} src={user?.avatar} />
            <Typography>{user?.name}</Typography>
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Lịch Họp Của Tôi</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Đặt Lịch Mới
          </Button>
        </Box>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          {meetings.map((meeting) => (
            <Grid item xs={12} md={6} key={meeting.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {meeting.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <RoomIcon fontSize="small" />
                    <Typography variant="body2">{meeting.room?.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EventIcon fontSize="small" />
                    <Typography variant="body2">
                      {format(new Date(meeting.startTime), 'dd/MM/yyyy HH:mm')} - 
                      {format(new Date(meeting.endTime), 'HH:mm')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">
                      Chủ trì: {meeting.organizer?.name}
                    </Typography>
                  </Box>
                  {meeting.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {meeting.description}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={meeting.status === 'scheduled' ? 'Sắp diễn ra' : meeting.status}
                      color={meeting.status === 'scheduled' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {meetings.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Bạn chưa có lịch họp nào
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={handleOpenDialog}
            >
              Đặt lịch họp đầu tiên
            </Button>
          </Box>
        )}
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Đặt Lịch Họp Mới</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            fullWidth
            label="Tiêu đề cuộc họp"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Phòng họp</InputLabel>
            <Select
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              label="Phòng họp"
            >
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name} ({room.capacity} người)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Thời gian bắt đầu"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label="Thời gian kết thúc"
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Thư ký</InputLabel>
            <Select
              name="secretaryId"
              value={formData.secretaryId}
              onChange={handleChange}
              label="Thư ký"
            >
              <MenuItem value="">Không có</MenuItem>
              {users.filter(u => u.id !== user.id).map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Người tham dự</InputLabel>
            <Select
              name="participantIds"
              multiple
              value={formData.participantIds}
              onChange={handleChange}
              label="Người tham dự"
            >
              {users.filter(u => u.id !== user.id).map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">Tạo Cuộc Họp</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;