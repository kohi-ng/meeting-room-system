import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console and keep component stack for UI
    console.error('Unhandled error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Đã xảy ra lỗi</Typography>
          <Typography sx={{ mb: 3 }}>{String(this.state.error)}</Typography>
          {this.state.errorInfo?.componentStack && (
            <Box sx={{ textAlign: 'left', maxWidth: 800, margin: '0 auto', mb: 2 }}>
              <Typography variant="subtitle2">Component stack:</Typography>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.errorInfo.componentStack}</pre>
            </Box>
          )}
          {this.state.error?.stack && (
            <Box sx={{ textAlign: 'left', maxWidth: 800, margin: '0 auto', mb: 2 }}>
              <Typography variant="subtitle2">Error stack:</Typography>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.error.stack}</pre>
            </Box>
          )}
          <Button variant="contained" onClick={() => window.location.reload()} sx={{ mr: 2 }}>Tải lại trang</Button>
          <Button variant="outlined" onClick={() => navigator.clipboard?.writeText(String(this.state.error) + '\n\n' + (this.state.error?.stack || '') + '\n\n' + (this.state.errorInfo?.componentStack || ''))}>
            Sao chép thông tin lỗi
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
