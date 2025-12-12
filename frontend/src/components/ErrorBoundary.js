import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error to an external service here
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Đã xảy ra lỗi</Typography>
          <Typography sx={{ mb: 3 }}>{String(this.state.error)}</Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>Tải lại trang</Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
