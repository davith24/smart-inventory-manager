import React, { useState } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Collapse,
  Card,
  CardContent,
  Grid,
  Paper,
  Container,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  CssBaseline
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Import your images
import visaImage from '../assets/visa.png';
import mastercardImage from '../assets/mastercard.png';
import qrImage from '../assets/QR.png';

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#5569ff',
    },
    secondary: {
      main: '#ff4081',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

function PaymentSubscription() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [creditCardDetails, setCreditCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [khqrImage, setKhqrImage] = useState(null);
  const [isCreditCardVisible, setIsCreditCardVisible] = useState(false);
  const [isKHQRVisible, setIsKHQRVisible] = useState(false);
  const [isVisaVisible, setIsVisaVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePaymentMethodChange = (event) => {
    const value = event.target.value;
    setSelectedPaymentMethod(value);
    setIsCreditCardVisible(value === 'mastercard');
    setIsKHQRVisible(value === 'khqr');
    setIsVisaVisible(value === 'visa');
    
    // Reset success message if payment method changes
    setShowSuccess(false);
  };

  const handleCreditCardChange = (event) => {
    const { name, value } = event.target;
    
    // Format card number with spaces after every 4 digits
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19); // Limit to 16 digits + 3 spaces
      setCreditCardDetails((prevDetails) => ({
        ...prevDetails,
        [name]: formattedValue,
      }));
      return;
    }
    
    // Format expiry date with slash after 2 digits
    if (name === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '');
      let formattedValue = cleaned;
      if (cleaned.length > 2) {
        formattedValue = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
      }
      setCreditCardDetails((prevDetails) => ({
        ...prevDetails,
        [name]: formattedValue,
      }));
      return;
    }
    
    // Limit CVV to 3 or 4 digits
    if (name === 'cvv') {
      const cleaned = value.replace(/\D/g, '');
      setCreditCardDetails((prevDetails) => ({
        ...prevDetails,
        [name]: cleaned.slice(0, 4),
      }));
      return;
    }
    
    // Regular handling for other fields
    setCreditCardDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubscribe = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      
      // Generate a mock QR code for KHQR if that's the selected method
      if (selectedPaymentMethod === 'khqr') {
        // In a real app, you'd get this from your payment provider's API
        setKhqrImage(qrImage);
      }
    }, 1500);
  };
  
  const isCardDetailsValid = () => {
    if (selectedPaymentMethod !== 'mastercard') return true;
    
    const { cardNumber, expiryDate, cvv, cardholderName } = creditCardDetails;
    return (
      cardNumber.replace(/\s/g, '').length === 16 &&
      expiryDate.length === 5 &&
      cvv.length >= 3 &&
      cardholderName.trim().length > 0
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Paper
            elevation={4}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              width: '100%',
              maxWidth: 600,
            }}
          >
            <Box
              sx={{
                p: 3,
                backgroundColor: 'primary.main',
                color: 'white',
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Premium Subscription
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Complete your payment to access premium features
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              {showSuccess && (
                <Alert 
                  icon={<CheckCircleIcon fontSize="inherit" />} 
                  severity="success"
                  sx={{ mb: 3 }}
                >
                  Your payment was processed successfully. Your subscription is now active!
                </Alert>
              )}
              
              <Card 
                sx={{ 
                  mb: 4, 
                  backgroundImage: 'linear-gradient(135deg, #f5f7ff 0%, #eef1ff 100%)',
                  border: '1px solid #e0e7ff',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Chip 
                    icon={<LocalOfferIcon />} 
                    label="BEST VALUE" 
                    color="primary" 
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: -12, 
                      right: 16,
                      fontWeight: 'bold'
                    }}
                  />
                  <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                    Premium Plan
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                    $9.99<Typography component="span" variant="body1" color="text.secondary">/month</Typography>
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={1}>
                    {['Unlimited Access', 'Priority Support', 'No Ads', 'Premium Content'].map((feature) => (
                      <Grid item xs={12} key={feature}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircleIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body1">{feature}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              <Typography variant="h6" gutterBottom>
                Select Payment Method
              </Typography>
              
              <RadioGroup
                aria-label="payment-method"
                name="payment_method"
                value={selectedPaymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <Grid container spacing={2}>
                  {/* Visa Option */}
                  <Grid item xs={12}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        border: selectedPaymentMethod === 'visa' ? '2px solid #5569ff' : '1px solid #e0e0e0',
                        '&:hover': {
                          borderColor: '#5569ff',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      <FormControlLabel
                        value="visa"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <img src={visaImage} alt="Visa" style={{ height: 30, marginRight: 12 }} />
                            <Typography fontWeight="medium">Visa</Typography>
                          </Box>
                        }
                        sx={{ flexGrow: 1, mr: 0 }}
                      />
                    </Card>
                  </Grid>
                  
                  {/* MasterCard Option */}
                  <Grid item xs={12}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        border: selectedPaymentMethod === 'mastercard' ? '2px solid #5569ff' : '1px solid #e0e0e0',
                        '&:hover': {
                          borderColor: '#5569ff',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      <FormControlLabel
                        value="mastercard"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <img src={mastercardImage} alt="MasterCard" style={{ height: 30, marginRight: 12 }} />
                            <Typography fontWeight="medium">MasterCard</Typography>
                          </Box>
                        }
                        sx={{ flexGrow: 1, mr: 0 }}
                      />
                    </Card>
                  </Grid>
                  
                  {/* KHQR Option */}
                  <Grid item xs={12}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        border: selectedPaymentMethod === 'khqr' ? '2px solid #5569ff' : '1px solid #e0e0e0',
                        '&:hover': {
                          borderColor: '#5569ff',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      <FormControlLabel
                        value="khqr"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <img src={qrImage} alt="KHQR" style={{ height: 30, marginRight: 12 }} />
                            <Typography fontWeight="medium">KHQR</Typography>
                          </Box>
                        }
                        sx={{ flexGrow: 1, mr: 0 }}
                      />
                    </Card>
                  </Grid>
                </Grid>
              </RadioGroup>

              {/* Visa Payment Section */}
              <Collapse in={isVisaVisible}>
                <Card sx={{ mt: 3, p: 3, backgroundColor: '#f8f9ff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CreditCardIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">Visa Payment</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    You'll be redirected to Visa's secure payment page to complete your transaction.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LockIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Your payment information is secure and encrypted
                    </Typography>
                  </Box>
                </Card>
              </Collapse>

              {/* MasterCard Payment Form */}
              <Collapse in={isCreditCardVisible}>
                <Card sx={{ mt: 3, p: 3, backgroundColor: '#f8f9ff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CreditCardIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">Card Details</Typography>
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    name="cardholderName"
                    value={creditCardDetails.cardholderName}
                    onChange={handleCreditCardChange}
                    margin="normal"
                    variant="outlined"
                    placeholder="John Smith"
                  />
                  
                  <TextField
                    fullWidth
                    label="Card Number"
                    name="cardNumber"
                    value={creditCardDetails.cardNumber}
                    onChange={handleCreditCardChange}
                    margin="normal"
                    variant="outlined"
                    placeholder="1234 5678 9012 3456"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <img src={mastercardImage} alt="MasterCard" style={{ height: 24 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Expiry Date"
                        name="expiryDate"
                        value={creditCardDetails.expiryDate}
                        onChange={handleCreditCardChange}
                        margin="normal"
                        variant="outlined"
                        placeholder="MM/YY"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="CVV"
                        name="cvv"
                        value={creditCardDetails.cvv}
                        onChange={handleCreditCardChange}
                        margin="normal"
                        variant="outlined"
                        placeholder="123"
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <LockIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Your payment information is secure and encrypted
                    </Typography>
                  </Box>
                </Card>
              </Collapse>

              {/* KHQR Payment Section */}
              <Collapse in={isKHQRVisible}>
                <Card sx={{ mt: 3, p: 3, backgroundColor: '#f8f9ff' }}>
                  <Typography variant="h6" gutterBottom>
                    KHQR Payment
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    Scan the QR code below with your mobile banking app to complete your payment.
                  </Typography>
                  
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 3, 
                    backgroundColor: 'white', 
                    borderRadius: 2,
                    border: '1px dashed #ccc'
                  }}>
                    {khqrImage ? (
                      <Box>
                        <img 
                          src={khqrImage} 
                          alt="KHQR Code" 
                          style={{ 
                            maxWidth: '200px', 
                            height: 'auto', 
                            display: 'block', 
                            margin: '0 auto'
                          }} 
                        />
                        <Typography variant="body2" color="success.main" sx={{ mt: 2, fontWeight: 'medium' }}>
                          QR code generated successfully!
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Click "Subscribe Now" to generate your payment QR code
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Once scanned, please follow the instructions in your banking app to authorize the payment.
                  </Typography>
                </Card>
              </Collapse>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSubscribe}
                fullWidth
                size="large"
                disabled={!selectedPaymentMethod || !isCardDetailsValid() || isLoading}
                sx={{ 
                  mt: 3,
                  height: 48,
                  position: 'relative'
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" sx={{ position: 'absolute' }} />
                ) : (
                  "Subscribe Now"
                )}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  By subscribing, you agree to our Terms of Service and Privacy Policy
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default PaymentSubscription;