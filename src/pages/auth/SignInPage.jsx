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
  signInFailure,
  signInStart,
  signInSuccess,
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

const SignInPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      dispatch(signInStart());

      const response = await api.post("/api/v1/auth/signin", formData);
      const data = response.data.data;
      const token = data.token;
      const userRole = data.user.roleId.slug;
      
      // Set Authorization header for future API requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      dispatch(signInSuccess(data));

      toast.success("Successfully signed in!");
      
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/client/dashboard");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage);
      dispatch(signInFailure(errorMessage));
    } finally {
      setLoading(false);
    }
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
                    Welcome Back!
                  </Typography>
                  <Typography variant="body1" mb={4}>
                    Access your account to manage your services and view your dashboard.
                  </Typography>
                  <img
                    src="https://img.freepik.com/free-vector/computer-login-concept-illustration_114360-7962.jpg?semt=ais_hybrid"
                    alt="Sign In Illustration"
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
                    Sign In
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Enter your credentials to access your account
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
                      id="usernameOrEmail"
                      label="Username or Email"
                      name="usernameOrEmail"
                      autoComplete="username"
                      value={formData.usernameOrEmail}
                      onChange={handleInput}
                      variant="outlined"
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
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleInput}
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
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ textAlign: "right", mb: 2 }}>
                      <Link
                        href="/forgot-password"
                        variant="body2"
                        underline="hover"
                        color="primary"
                      >
                        Forgot password?
                      </Link>
                    </Box>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={!formData.usernameOrEmail || !formData.password || loading}
                      sx={{
                        mt: 1,
                        mb: 3,
                        py: 1.5,
                        position: "relative",
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" sx={{ position: "absolute" }} />
                      ) : (
                        "Sign In"
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
                          Don't have an account?{" "}
                        </Typography>
                        <Link href="/signup" variant="body2" fontWeight="medium" underline="hover">
                          Sign Up
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

export default SignInPage;