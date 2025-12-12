import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
  Button, Box, Chip, Typography, FormControl, InputLabel, Alert
} from '@mui/material';
import { meetingAPI } from '../services/api';

function BookingRoomModal({ open, onClose, selectedRoom, onBookingSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    secretaryId: '',
    participantIds: []
  });
  const [docs, setDocs] = useState([]);
  const [docUrl, setDocUrl] = useState('');
  const [participants, setParticipants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUsers();
      setError('');
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setAllUsers(data.users || []);
    } catch (err) {
      console.error('Load users error:', err);
    }
  };

  const handleAddDoc = () => {
    if (!docUrl.trim()) {
      setError('Vui lòng nhập link tài liệu');
      return;
    }
    setDocs([...docs, docUrl]);
    setDocUrl('');
  };

  const handleRemoveDoc = (idx) => {
    setDocs(docs.filter((_, i) => i !== idx));
  };

  const handleAddParticipant = () => {
    if (!newParticipantEmail.trim()) {
      setError('Vui lòng nhập email thành viên');
      return;
    }
    const user = allUsers.find(u => u.email.toLowerCase() === newParticipantEmail.toLowerCase());
    if (!user) {
      setError('Email không tồn tại trong hệ thống');
      return;
    }
    if (participants.find(p => p.id === user.id)) {
      setError('Người dùng này đã được thêm');
      return;
    }
    setParticipants([...participants, { id: user.id, name: user.name, email: user.email, role: 'participant' }]);
    setNewParticipantEmail('');
    setError('');
  };

  const handleRemoveParticipant = (userId) => {
    setParticipants(participants.filter(p => p.id !== userId));
  };

  const handleSecretaryChange = (e) => {
    setFormData({ ...formData, secretaryId: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề cuộc họp');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }
    if (!formData.secretaryId) {
      setError('Vui lòng chọn Thư kí');
      return;
    }

    setLoading(true);
    try {
      const participantIds = participants.map(p => p.id);
      await meetingAPI.create({
        title: formData.title,
        description: formData.description,
        roomId: selectedRoom.id,
        startTime: formData.startTime,
        endTime: formData.endTime,
        secretaryId: formData.secretaryId,
        participantIds,
        documentsUrls: docs
      });
      alert('Đã đăng ký phòng thành công!');
      onBookingSuccess();
      onClose();
      // Reset form
      setFormData({ title: '', description: '', startTime: '', endTime: '', secretaryId: '', participantIds: [] });
      setDocs([]);
      setParticipants([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi đăng ký phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Đăng ký phòng {selectedRoom?.name}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          fullWidth
          label="Tiêu đề cuộc họp"
          placeholder="Ôn tập, phỏng vấn, workshop..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Mô tả"
          multiline
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Bắt đầu"
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          fullWidth
          label="Kết thúc"
          type="datetime-local"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Thư kí (bắt buộc)</InputLabel>
          <Select value={formData.secretaryId} onChange={handleSecretaryChange} label="Thư kí (bắt buộc)">
            {allUsers.map(u => <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>)}
          </Select>
        </FormControl>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Tài liệu (Google Drive)</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="https://drive.google.com/..."
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              fullWidth
            />
            <Button onClick={handleAddDoc} variant="outlined">Thêm</Button>
          </Box>
          <Box sx={{ mt: 1 }}>
            {docs.map((doc, idx) => (
              <Chip key={idx} label={doc.substring(0, 30) + '...'} onDelete={() => handleRemoveDoc(idx)} sx={{ mr: 1, mb: 1 }} />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Thành viên tham gia</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              placeholder="email@example.com"
              value={newParticipantEmail}
              onChange={(e) => setNewParticipantEmail(e.target.value)}
              fullWidth
            />
            <Button onClick={handleAddParticipant} variant="outlined">Thêm</Button>
          </Box>
          <Box>
            {participants.map(p => (
              <Chip
                key={p.id}
                label={`${p.name} (${p.email})`}
                onDelete={() => handleRemoveParticipant(p.id)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        </Box>

        {selectedRoom && (
          <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2"><strong>Vị trí:</strong> {selectedRoom.location}</Typography>
            <Typography variant="body2"><strong>Sức chứa:</strong> {selectedRoom.capacity} người</Typography>
            <Typography variant="body2"><strong>Thiết bị:</strong> {(selectedRoom.equipment || []).join(', ')}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookingRoomModal;
