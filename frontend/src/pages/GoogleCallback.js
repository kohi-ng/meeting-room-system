// ===============================================
// FILE: frontend/src/pages/GoogleCallback.js
// ===============================================
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      handleGoogleCallback(token);
      navigate('/dashboard');
    } else if (error) {
      navigate('/login?error=' + error);
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, handleGoogleCallback]);

  return (
    <Container>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Đang xử lý đăng nhập...</Typography>
      </Box>
    </Container>
  );
}

export default GoogleCallback;