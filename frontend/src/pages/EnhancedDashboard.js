import React, { useState, useEffect } from 'react';
import { roomAPI, meetingAPI } from '../services/api';
import {
  Box, Container, Typography, Select, MenuItem, Button, Grid, Card, CardContent, Chip
} from '@mui/material';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameDay, isSameMonth } from 'date-fns';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function EnhancedDashboard() {
  const [rooms, setRooms] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [calendarMode, setCalendarMode] = useState('week');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState('all');

  useEffect(() => {
    roomAPI.getAll().then(res => setRooms(res.data.rooms || []));
    meetingAPI.getAll().then(res => setMeetings(res.data.meetings || []));
  }, []);

  // Filter meetings by room
  const filteredMeetings = selectedRoom === 'all'
    ? meetings
    : meetings.filter(m => m.roomId === selectedRoom);

  // Calendar rendering helpers
  function renderWeekView() {
    const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    return (
      <Box>
        <Grid container spacing={1}>
          {days.map(day => (
            <Grid item xs={12/7} key={day.toISOString()}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">{format(day, 'EEE dd/MM')}</Typography>
                  {filteredMeetings.filter(m => isSameDay(new Date(m.startTime || m.start), day)).map(m => (
                    <Box key={m.id} sx={{ mt: 1, mb: 1 }}>
                      <Chip label={m.title} color="primary" size="small" />
                      <Typography variant="caption" display="block">
                        {rooms.find(r => r.id === m.roomId)?.name || m.roomId} | {format(new Date(m.startTime || m.start), 'HH:mm')} - {format(new Date(m.endTime || m.end), 'HH:mm')}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  function renderMonthView() {
    const monthStart = startOfMonth(anchorDate);
    const monthEnd = endOfMonth(anchorDate);
    const days = [];
    let day = startOfWeek(monthStart, { weekStartsOn: 1 });
    while (day <= monthEnd || days.length % 7 !== 0) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    return (
      <Box>
        <Grid container spacing={1}>
          {days.map((d, idx) => (
            <Grid item xs={12/7} key={d.toISOString()}>
              <Card variant={isSameMonth(d, anchorDate) ? 'outlined' : 'elevation'} sx={{ opacity: isSameMonth(d, anchorDate) ? 1 : 0.4 }}>
                <CardContent>
                  <Typography variant="subtitle2">{format(d, 'dd/MM')}</Typography>
                  {filteredMeetings.filter(m => isSameDay(new Date(m.startTime || m.start), d)).map(m => (
                    <Box key={m.id} sx={{ mt: 1, mb: 1 }}>
                      <Chip label={m.title} color="primary" size="small" />
                      <Typography variant="caption" display="block">
                        {rooms.find(r => r.id === m.roomId)?.name || m.roomId} | {format(new Date(m.startTime || m.start), 'HH:mm')} - {format(new Date(m.endTime || m.end), 'HH:mm')}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Select value={calendarMode} onChange={e => setCalendarMode(e.target.value)} size="small">
          <MenuItem value="week">Tuần</MenuItem>
          <MenuItem value="month">Tháng</MenuItem>
        </Select>
        <Select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} size="small">
          <MenuItem value="all">Tất cả phòng</MenuItem>
          {rooms.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
        </Select>
        <Button onClick={() => setAnchorDate(new Date())}>Hôm nay</Button>
        <Button onClick={() => setAnchorDate(prev => calendarMode === 'week' ? addDays(prev, -7) : addDays(prev, -30))}>Trước</Button>
        <Button onClick={() => setAnchorDate(prev => calendarMode === 'week' ? addDays(prev, 7) : addDays(prev, 30))}>Tiếp</Button>
      </Box>
      {calendarMode === 'week' ? renderWeekView() : renderMonthView()}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Thông tin phòng</Typography>
        <Grid container spacing={2}>
          {rooms.map(r => (
            <Grid item xs={12} sm={6} md={3} key={r.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1">{r.name}</Typography>
                  <Typography variant="body2">Vị trí: {r.location}</Typography>
                  <Typography variant="body2">Sức chứa: {r.capacity}</Typography>
                  <Typography variant="body2">Thiết bị: {(r.equipment||[]).join(', ')}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default EnhancedDashboard;
