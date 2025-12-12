import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { roomAPI, meetingAPI, userAPI } from '../services/api';
import {
  Container, Box, AppBar, Toolbar, Typography, Button,
  IconButton, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tabs, Tab,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, Avatar, Alert
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Event as EventIcon,
  OpenInNew as OpenInNewIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import BookingRoomModal from '../components/BookingRoomModal';
import MeetingMinutes from '../components/MeetingMinutes';
import { buildGoogleCalendarLink } from '../utils/googleCalendarHelper';
import useMeetingReminder from '../hooks/useMeetingReminder';

function Dashboard() {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBookingRoom, setSelectedBookingRoom] = useState(null);
  const [openBookingModal, setOpenBookingModal] = useState(false);
  const [openMinutesDialog, setOpenMinutesDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
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

  useMeetingReminder(meetings, user?.email, rooms);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsRes, meetingsRes, usersRes] = await Promise.all([
        roomAPI.getAll({ isActive: true }),
        meetingAPI.getAll(),
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
        setSuccess('');
        setFormData({
          title: '',
          description: '',
          roomId: '',
          secretaryId: '',
          startTime: '',
          endTime: '',
          participantIds: []
        });
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Lỗi khi tạo cuộc họp');
    }
  };

  const myMeetings = meetings.filter(m => 
    m.organizerId === user?.id || 
    m.secretaryId === user?.id ||
    m.participantDetails?.some(p => p.userId === user?.id)
  );

  const handleOpenBookingRoom = (room) => {
    setSelectedBookingRoom(room);
    setOpenBookingModal(true);
  };

  const handleBookingSuccess = () => {
    loadData();
    setOpenBookingModal(false);
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

      <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tab label="Cuộc họp của tôi" />
          <Tab label="Đặt phòng mới" />
          <Tab label="Tạo cuộc họp" />
          <Tab label="Thêm biên bản" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>Cuộc họp của tôi ({myMeetings.length})</Typography>
            {myMeetings.length === 0 ? (
              <Alert severity="info">Bạn chưa có cuộc họp nào</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Tiêu đề</strong></TableCell>
                      <TableCell><strong>Thời gian</strong></TableCell>
                      <TableCell><strong>Phòng</strong></TableCell>
                      <TableCell><strong>Vai trò</strong></TableCell>
                      <TableCell><strong>Tài liệu</strong></TableCell>
                      <TableCell><strong>Biên bản</strong></TableCell>
                      <TableCell><strong>Calendar</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myMeetings.map(m => {
                      const room = rooms.find(r => r.id === m.roomId);
                      let myRole = 'Thành phần';
                      if (m.organizerId === user?.id) myRole = 'Chủ tọa';
                      else if (m.secretaryId === user?.id) myRole = 'Thư kí';
                      
                      return (
                        <TableRow key={m.id}>
                          <TableCell>{m.title}</TableCell>
                          <TableCell>{format(new Date(m.startTime), 'dd/MM/yyyy HH:mm')} - {format(new Date(m.endTime), 'HH:mm')}</TableCell>
                          <TableCell>{room?.name}</TableCell>
                          <TableCell><Chip label={myRole} size="small" color={m.organizerId === user?.id ? 'primary' : 'default'} /></TableCell>
                          <TableCell>
                            {(m.documentsUrls || []).length > 0 ? (
                              <Chip label={`${m.documentsUrls.length} tài liệu`} size="small" />
                            ) : (
                              <Typography variant="caption" color="text.secondary">—</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {m.minutesFileUrl ? (
                              <Button size="small" startIcon={<FileDownloadIcon />} href={m.minutesFileUrl} target="_blank">
                                Xem
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.secondary">Chưa có</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<OpenInNewIcon />}
                              href={buildGoogleCalendarLink(m, room)}
                              target="_blank"
                            >
                              Thêm
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>Đặt phòng mới</Typography>
            <Grid container spacing={2}>
              {rooms.map(room => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => handleOpenBookingRoom(room)}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{room.name}</Typography>
                      <Typography variant="body2" color="text.secondary">📍 {room.location}</Typography>
                      <Typography variant="body2">👥 Sức chứa: {room.capacity} người</Typography>
                      <Typography variant="body2">🛠️ Thiết bị: {(room.equipment || []).join(', ')}</Typography>
                      <Button fullWidth variant="contained" sx={{ mt: 2 }}>Đặt ngay</Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>Tạo cuộc họp mới</Typography>
            <Card sx={{ p: 3 }}>
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
                  {users.filter(u => u.id !== user?.id).map((u) => (
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
                  {users.filter(u => u.id !== user?.id).map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button onClick={handleSubmit} variant="contained">Tạo Cuộc Họp</Button>
              </Box>
            </Card>
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>Thêm biên bản họp</Typography>
            <Button variant="contained" onClick={() => setOpenMinutesDialog(true)}>
              Thêm biên bản
            </Button>
          </Box>
        )}
      </Container>

      <BookingRoomModal 
        open={openBookingModal} 
        onClose={() => setOpenBookingModal(false)}
        selectedRoom={selectedBookingRoom}
        onBookingSuccess={handleBookingSuccess}
      />

      <MeetingMinutes
        open={openMinutesDialog}
        onClose={() => setOpenMinutesDialog(false)}
        userEmail={user?.email}
        onSuccess={loadData}
      />
    </Box>
  );
}

export default Dashboard;
