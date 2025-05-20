import React, { useState } from "react";
import {
  Button,
  CssBaseline,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Container,
  Grid,
  Box,
  Link,
  Avatar,
  Paper,
  Divider,
  CircularProgress
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  signUpFailure,
  signUpStart,
  signUpSuccess,
} from "../../app/user/userSlice";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import GoogleButton from "../../components/GoogleButton";

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#5569ff",
    },
    secondary: {
      main: "#ff4081",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h5: {
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
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 0",
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
  },
});

const SignUpPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...formData };
    let updatedErrors = { ...errors };

    if (name === "username") {
      const regex = /^[a-z0-9]*$/;
      if (!regex.test(value)) {
        updatedErrors.username =
          "Username must be lowercase and contain only letters and numbers.";
      } else {
        updatedErrors.username = "";
      }
      updatedForm.username = value;
    } else if (name === "name") {
      const regex = /^[a-zA-Z\s]*$/;
      if (!regex.test(value)) {
        updatedErrors.name = "Name can only contain letters and spaces.";
      } else {
        updatedErrors.name = "";
      }
      updatedForm.name = value;
    } else if (name === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        updatedErrors.email = "Please enter a valid email address.";
      } else {
        updatedErrors.email = "";
      }
      updatedForm.email = value;
    } else if (name === "password") {
      if (value.length < 8) {
        updatedErrors.password = "Password must be at least 8 characters long.";
      } else {
        updatedErrors.password = "";
      }
      updatedForm.password = value;
      
      // Also update confirm password error if it exists
      if (updatedForm.confirmPassword && updatedForm.confirmPassword !== value) {
        updatedErrors.confirmPassword = "Passwords must match.";
      } else if (updatedForm.confirmPassword) {
        updatedErrors.confirmPassword = "";
      }
    } else if (name === "confirmPassword") {
      if (value !== formData.password) {
        updatedErrors.confirmPassword = "Passwords must match.";
      } else {
        updatedErrors.confirmPassword = "";
      }
      updatedForm.confirmPassword = value;
    }

    setFormData(updatedForm);
    setErrors(updatedErrors);
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirmPasswordToggle = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      dispatch(signUpStart());
      const response = await api.post("api/v1/auth/signup", formData);
      const data = response.data;
      dispatch(signUpSuccess(data));
      toast.success("Account created successfully! Please sign in.");
      navigate("/signin");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage);
      dispatch(signUpFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.username &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      !errors.name &&
      !errors.username &&
      !errors.email &&
      !errors.password &&
      !errors.confirmPassword
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Paper
            elevation={4}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              width: "100%",
            }}
          >
            <Grid container>
              {/* Left side - Image */}
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  display: { xs: "none", md: "flex" },
                  position: "relative",
                  backgroundColor: "primary.light",
                  backgroundImage: "linear-gradient(120deg, #5569ff 0%, #7b85ff 100%)",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                }}
              >
                <Box sx={{ textAlign: "center", color: "white", zIndex: 1, p: 4 }}>
                  <Typography variant="h4" fontWeight="bold" mb={2}>
                    Create Account
                  </Typography>
                  <Typography variant="body1" mb={4}>
                    Join our platform to access exclusive features and personalized services.
                  </Typography>
                  <img
                    src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg"
                    alt="Sign Up Illustration"
                    style={{ maxWidth: "80%", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
                  />
                </Box>
              </Grid>

              {/* Right side - Form */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: { xs: 3, sm: 6 },
                  }}
                >
                  <Avatar
                    sx={{
                      m: 1,
                      bgcolor: "primary.main",
                      width: 56,
                      height: 56,
                    }}
                  >
                    <LockOutlinedIcon fontSize="large" />
                  </Avatar>
                  <Typography component="h1" variant="h5" fontWeight="bold" mt={2}>
                    Sign Up
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Fill in your details to create a new account
                  </Typography>

                  <Box
                    component="form"
                    noValidate
                    sx={{ mt: 1, width: "100%" }}
                    onSubmit={handleSubmit}
                  >
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="name"
                      label="Full Name"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleInput}
                      error={Boolean(errors.name)}
                      helperText={errors.name}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      value={formData.username}
                      onChange={handleInput}
                      error={Boolean(errors.username)}
                      helperText={errors.username}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInput}
                      error={Boolean(errors.email)}
                      helperText={errors.email}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleInput}
                      error={Boolean(errors.password)}
                      helperText={errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handlePasswordToggle}
                              edge="end"
                              aria-label="toggle password visibility"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleInput}
                      error={Boolean(errors.confirmPassword)}
                      helperText={errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleConfirmPasswordToggle}
                              edge="end"
                              aria-label="toggle confirm password visibility"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading || !isFormValid()}
                      sx={{
                        mt: 2,
                        mb: 3,
                        py: 1.5,
                        position: "relative",
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" sx={{ position: "absolute" }} />
                      ) : (
                        "Create Account"
                      )}
                    </Button>

                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        OR
                      </Typography>
                    </Divider>

                    <GoogleButton />

                    <Grid container justifyContent="center" mt={3}>
                      <Grid item>
                        <Typography variant="body2" color="text.secondary" component="span">
                          Already have an account?{" "}
                        </Typography>
                        <Link href="/signin" variant="body2" fontWeight="medium" underline="hover">
                          Sign In
                        </Link>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default SignUpPage;