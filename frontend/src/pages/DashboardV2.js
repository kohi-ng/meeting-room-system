import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { roomAPI, meetingAPI, userAPI } from '../services/api';
import {
  Container, Box, AppBar, Toolbar, Typography, Button,
  IconButton, Grid, Card, CardContent, CardActions,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tabs, Tab,
  FormControl, InputLabel, Select, MenuItem,
  Chip, Avatar, Alert
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Event as EventIcon,
  OpenInNew as OpenInNewIcon,
  FileDownload as FileDownloadIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, addWeeks } from 'date-fns';
import BookingRoomModal from '../components/BookingRoomModal';
import MeetingMinutes from '../components/MeetingMinutes';
import { buildGoogleCalendarLink } from '../utils/googleCalendarHelper';
import useMeetingReminder from '../hooks/useMeetingReminder';

function Dashboard() {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedBookingRoom, setSelectedBookingRoom] = useState(null);
  const [openBookingModal, setOpenBookingModal] = useState(false);
  const [openMinutesDialog, setOpenMinutesDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [calendarMode, setCalendarMode] = useState('month'); // 'month' or 'week'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [error, setError] = useState('');

  useMeetingReminder(meetings, user?.email, rooms);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsRes, meetingsRes] = await Promise.all([
        roomAPI.getAll({ isActive: true }),
        meetingAPI.getAll()
      ]);
      setRooms(roomsRes.data.rooms || []);
      setMeetings(meetingsRes.data.meetings || []);
      setError('');
    } catch (error) {
      console.error('Load data error:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại!');
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

  // Calendar rendering
  const renderMonthCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const filteredMeetings = selectedRoom === 'all' 
      ? meetings 
      : meetings.filter(m => m.roomId === selectedRoom);

    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {format(currentDate, 'MMMM yyyy', { locale: require('date-fns/locale/vi') })}
          </Typography>
          <Box>
            <Button startIcon={<ChevronLeftIcon />} onClick={() => setCurrentDate(addMonths(currentDate, -1))}>
              Trước
            </Button>
            <Button onClick={() => setCurrentDate(new Date())}>Hôm nay</Button>
            <Button onClick={() => setCurrentDate(addMonths(currentDate, 1))} endIcon={<ChevronRightIcon />}>
              Sau
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Grid container spacing={0.5}>
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(day => (
              <Grid item xs={12/7} key={day} sx={{ textAlign: 'center', fontWeight: 'bold', py: 1 }}>
                {day}
              </Grid>
            ))}
            {days.map(day => {
              const dayMeetings = filteredMeetings.filter(m => {
                const mDate = new Date(m.startTime);
                return format(mDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
              });
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();

              return (
                <Grid
                  item
                  xs={12/7}
                  key={day.toString()}
                  sx={{
                    minHeight: 120,
                    border: '1px solid #e0e0e0',
                    p: 1,
                    backgroundColor: isCurrentMonth ? '#fff' : '#f5f5f5',
                    opacity: isCurrentMonth ? 1 : 0.5
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {format(day, 'd')}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {dayMeetings.map(m => {
                      const room = rooms.find(r => r.id === m.roomId);
                      return (
                        <Chip
                          key={m.id}
                          label={m.title}
                          size="small"
                          sx={{
                            display: 'block',
                            width: '100%',
                            mb: 0.5,
                            fontSize: '11px',
                            backgroundColor: '#3b82f6',
                            color: '#fff'
                          }}
                          title={`${room?.name} - ${format(new Date(m.startTime), 'HH:mm')}`}
                        />
                      );
                    })}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Box>
    );
  };

  const renderWeekCalendar = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8h to 18h

    const filteredMeetings = selectedRoom === 'all' 
      ? meetings 
      : meetings.filter(m => m.roomId === selectedRoom);

    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Tuần {format(currentDate, 'w yyyy', { locale: require('date-fns/locale/vi') })}
          </Typography>
          <Box>
            <Button startIcon={<ChevronLeftIcon />} onClick={() => setCurrentDate(addWeeks(currentDate, -1))}>
              Tuần trước
            </Button>
            <Button onClick={() => setCurrentDate(new Date())}>Hôm nay</Button>
            <Button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} endIcon={<ChevronRightIcon />}>
              Tuần sau
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '80px' }}>Giờ</TableCell>
                {days.map(day => (
                  <TableCell key={day.toString()} align="center">
                    {format(day, 'EEE d/M', { locale: require('date-fns/locale/vi') })}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {hours.map(hour => (
                <TableRow key={hour}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {String(hour).padStart(2, '0')}:00
                  </TableCell>
                  {days.map(day => {
                    const cellMeetings = filteredMeetings.filter(m => {
                      const mDate = new Date(m.startTime);
                      const mHour = mDate.getHours();
                      return format(mDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && 
                             mHour === hour;
                    });

                    return (
                      <TableCell key={`${day}-${hour}`} sx={{ p: 0.5, height: 80 }}>
                        {cellMeetings.map(m => {
                          const room = rooms.find(r => r.id === m.roomId);
                          return (
                            <Chip
                              key={m.id}
                              label={`${m.title} (${room?.name})`}
                              size="small"
                              sx={{
                                display: 'block',
                                width: '100%',
                                mb: 0.5,
                                fontSize: '10px',
                                backgroundColor: '#10b981',
                                color: '#fff'
                              }}
                            />
                          );
                        })}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
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
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tab label="📅 Lịch" />
          <Tab label="🏢 Đặt Phòng" />
          <Tab label="📋 Cuộc Họp Của Tôi" />
          <Tab label="📄 Biên Bản" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Chế độ xem</InputLabel>
                <Select value={calendarMode} onChange={(e) => setCalendarMode(e.target.value)} label="Chế độ xem">
                  <MenuItem value="month">Tháng</MenuItem>
                  <MenuItem value="week">Tuần</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Phòng</InputLabel>
                <Select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} label="Phòng">
                  <MenuItem value="all">Tất cả phòng</MenuItem>
                  {rooms.map(room => (
                    <MenuItem key={room.id} value={room.id}>{room.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {calendarMode === 'month' ? renderMonthCalendar() : renderWeekCalendar()}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenBookingRoom(null)} sx={{ mb: 2 }}>
              Đặt Phòng Mới
            </Button>
            <Grid container spacing={2}>
              {rooms.map(room => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => handleOpenBookingRoom(room)}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{room.name}</Typography>
                      <Typography variant="body2" color="text.secondary">📍 {room.location}</Typography>
                      <Typography variant="body2">👥 Sức chứa: {room.capacity} người</Typography>
                      <Typography variant="body2">🛠️ Thiết bị: {(room.equipment || []).join(', ')}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button fullWidth variant="contained" size="small">
                        Đặt ngay
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Cuộc họp của tôi ({myMeetings.length})</Typography>
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

        {tabValue === 3 && (
          <Box>
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
