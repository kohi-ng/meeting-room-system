import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  Button, Box, FormControl, InputLabel, Alert, Typography
} from '@mui/material';
import { meetingAPI } from '../services/api';

function MeetingMinutes({ open, onClose, userEmail, onSuccess }) {
  const [meetings, setMeetings] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [minutesUrl, setMinutesUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadMeetings();
      setError('');
    }
  }, [open]);

  const loadMeetings = async () => {
    try {
      const res = await meetingAPI.getAll();
      // Filter meetings where user is secretary
      const secretaryMeetings = res.data.meetings.filter(m => 
        m.secretaryId === (m.secretary?.id || m.secretaryId) || 
        m.participantDetails?.some(p => p.userId === m.secretaryId)
      );
      setMeetings(secretaryMeetings);
    } catch (err) {
      console.error('Load meetings error:', err);
    }
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!selectedMeetingId) {
      setError('Vui lòng chọn cuộc họp');
      return;
    }
    if (!minutesUrl.trim()) {
      setError('Vui lòng nhập link biên bản');
      return;
    }

    setLoading(true);
    try {
      await meetingAPI.uploadMinutes(selectedMeetingId, { fileUrl: minutesUrl });
      alert('Đã lưu biên bản thành công!');
      onSuccess?.();
      onClose();
      setSelectedMeetingId('');
      setMinutesUrl('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu biên bản');
    } finally {
      setLoading(false);
    }
  };

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Thêm biên bản họp (chỉ Thư kí)</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Chọn cuộc họp</InputLabel>
          <Select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            label="Chọn cuộc họp"
          >
            {meetings.map(m => (
              <MenuItem key={m.id} value={m.id}>
                {m.title} - {new Date(m.startTime).toLocaleString('vi-VN')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Link biên bản (Google Drive)"
          type="url"
          placeholder="https://drive.google.com/..."
          value={minutesUrl}
          onChange={(e) => setMinutesUrl(e.target.value)}
          margin="normal"
        />

        {selectedMeeting && (
          <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2"><strong>Tiêu đề:</strong> {selectedMeeting.title}</Typography>
            <Typography variant="body2"><strong>Thời gian:</strong> {new Date(selectedMeeting.startTime).toLocaleString('vi-VN')}</Typography>
            <Typography variant="body2"><strong>Thư kí:</strong> {selectedMeeting.secretary?.name || selectedMeeting.secretaryId}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !selectedMeetingId || !minutesUrl}>
          {loading ? 'Đang xử lý...' : 'Lưu biên bản'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MeetingMinutes;
