import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Paper,
  IconButton,
  useTheme,
  alpha,
  Avatar,
  Breadcrumbs,
  Tooltip,
  Alert,
  InputAdornment,
  Switch,
  FormControlLabel
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import MainLayout from "../../layouts/MainLayout";
import { Helmet } from "react-helmet";
import {
  Save,
  ArrowBack,
  Person,
  Visibility,
  VisibilityOff,
  Email,
  Badge,
  PersonAdd,
  Cancel,
  AccountCircle
} from "@mui/icons-material";

function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.token;
  const theme = useTheme();
  const isNewUser = id === "0";
  const title = isNewUser ? "Add New User" : "Edit User";

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: ""
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Fetch roles for dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('api/v1/roles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoles(response.data.data || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast.error("Failed to load roles");
      }
    };
    
    fetchRoles();
  }, []);

  // Fetch user details if editing
  useEffect(() => {
    if (isNewUser) return;
    
    const getUser = async () => {
      try {
        setFetchingUser(true);
        const response = await api.get(`api/v1/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const userData = response.data.data;
        // Remove password as it shouldn't be pre-filled
        const { password, ...userDataWithoutPassword } = userData;
        
        setFormData({
          ...userDataWithoutPassword,
          password: "",
          confirmPassword: "",
          // Convert roleId object to string ID if needed
          roleId: userData.roleId?._id || userData.roleId || ""
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error(error.response?.data?.message || "Failed to fetch user");
        // Navigate back on error
        navigate("/admin/user-management");
      } finally {
        setFetchingUser(false);
      }
    };
    
    getUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setIsDirty(true);
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Validate password (only required for new users)
    if (isNewUser) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    } else {
      // For existing users, only validate if password is provided
      if (formData.password && formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    }
    
    // Validate role
    if (!formData.roleId) {
      newErrors.roleId = "Please select a role";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setLoading(true);
    
    try {
      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...dataToSubmit } = formData;
      
      // If editing and password is empty, remove it
      if (!isNewUser && !dataToSubmit.password) {
        delete dataToSubmit.password;
      }
      
      if (isNewUser) {
        await api.post("api/v1/auth/signup", {
          ...dataToSubmit,
          sendWelcomeEmail
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("User created successfully!");
      } else {
        await api.patch(`api/v1/users/${id}`, dataToSubmit, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("User updated successfully!");
      }
      
      navigate("/admin/user-management");
    } catch (error) {
      console.error("Error saving user:", error);
      const errorMessage = error.response?.data?.message || 
                          (isNewUser ? "Failed to create user" : "Failed to update user");
      toast.error(errorMessage);
      
      // Handle field-specific errors from API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        navigate("/admin/user-management");
      }
    } else {
      navigate("/admin/user-management");
    }
  };

  if (fetchingUser) {
    return (
      <MainLayout>
        <Helmet>
          <title>Loading User | Admin</title>
        </Helmet>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="80vh"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="textSecondary">
            Loading user data...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>{title} | Admin</title>
      </Helmet>
      
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>
            Dashboard
          </Link>
          <Link to="/admin/user-management" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>
            User Management
          </Link>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Header Card */}
            <Grid item xs={12}>
              <Card 
                elevation={0} 
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.05), 
                  borderRadius: 2,
                  mb: 2 
                }}
              >
                <CardContent sx={{ py: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: isNewUser ? alpha(theme.palette.success.main, 0.8) : alpha(theme.palette.primary.main, 0.8),
                          width: 56,
                          height: 56,
                          mr: 2
                        }}
                      >
                        {isNewUser ? <PersonAdd /> : <AccountCircle />}
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {title}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          {isNewUser ? "Create a new user account" : "Update user information"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        sx={{ mr: 2 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={isNewUser ? <PersonAdd /> : <Save />}
                        disabled={loading}
                        sx={{ px: 3 }}
                      >
                        {loading ? (
                          <>
                            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                            {isNewUser ? "Creating..." : "Saving..."}
                          </>
                        ) : isNewUser ? (
                          "Create User"
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Left column - User Information */}
            <Grid item xs={12} md={8}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="medium" gutterBottom>
                    User Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    {/* Full Name */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    {/* Username */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleChange}
                        error={!!errors.username}
                        helperText={errors.username}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Badge color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    {/* Email */}
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    {/* Role */}
                    <Grid item xs={12}>
                      <FormControl fullWidth error={!!errors.roleId}>
                        <InputLabel id="role-select-label">Role *</InputLabel>
                        <Select
                          labelId="role-select-label"
                          name="roleId"
                          value={formData.roleId || ''}
                          onChange={handleChange}
                          label="Role *"
                        >
                          {roles?.data?.map((role) => (
                            <MenuItem key={role._id} value={role._id}>
                              {role.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.roleId && <FormHelperText>{errors.roleId}</FormHelperText>}
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Right column - Security */}
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="medium" gutterBottom>
                    Security
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {/* Password */}
                  <TextField
                    fullWidth
                    required={isNewUser}
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ''}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password || (!isNewUser && "Leave blank to keep current password")}
                    sx={{ mb: 3 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  {/* Confirm Password */}
                  <TextField
                    fullWidth
                    required={isNewUser || !!formData.password}
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword || ''}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    sx={{ mb: 3 }}
                  />
                  
                  {isNewUser && (
                    <Box mt={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={sendWelcomeEmail}
                            onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Send welcome email"
                      />
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                        An email will be sent to the user with their login credentials
                      </Typography>
                    </Box>
                  )}
                  
                  {!isNewUser && (
                    <Alert severity="info" sx={{ mt: 3 }}>
                      Any changes to security settings will log the user out on their next session.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Box>
    </MainLayout>
  );
}

export default AdminUserEdit;