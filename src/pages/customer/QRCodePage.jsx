import React, { useEffect, useRef, useState } from 'react';
import { Button, Box, TextField, Snackbar, Alert } from '@mui/material';
// import QRCode from 'qrcode';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LinkIcon from '@mui/icons-material/Link';

const QRCodeGenerator = () => {
  const [url, setUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const qrCodeRef = useRef(null);

  useEffect(() => {
    if (url) {
      generateQRCode();
    }
  }, [url]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
      });
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    if (!url) return;
    
    navigator.clipboard.writeText(url)
      .then(() => {
        setSnackbarMessage('Link copied to clipboard!');
        setOpenSnackbar(true);
      })
      .catch((err) => {
        setSnackbarMessage('Failed to copy link');
        setOpenSnackbar(true);
        console.error('Could not copy text: ', err);
      });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        p: 4,
        maxWidth: 400,
        margin: '0 auto',
      }}
    >
      <TextField
        fullWidth
        label="Enter URL"
        variant="outlined"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
      />

      {qrCodeDataUrl && (
        <Box
          ref={qrCodeRef}
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <img src={qrCodeDataUrl} alt="QR Code" />
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={handleDownload}
          disabled={!qrCodeDataUrl}
        >
          Download QR Code
        </Button>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<LinkIcon />}
          onClick={handleCopyLink}
          disabled={!url}
        >
          Copy Link
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QRCodeGenerator;