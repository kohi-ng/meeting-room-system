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
  const { handleGoogleCallback, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // store token and wait for AuthProvider to finish loading user
      handleGoogleCallback(token);
      return;
    }

    if (error) {
      navigate('/login?error=' + error);
      return;
    }

    navigate('/login');
  }, [searchParams, handleGoogleCallback, navigate]);

  // When auth finished loading after token set, redirect accordingly
  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) navigate('/dashboard');
    else navigate('/login');
  }, [loading, isAuthenticated, navigate]);

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