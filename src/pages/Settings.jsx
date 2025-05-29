import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Paper,
  Button,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { useSelector } from "react-redux";

const Settings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.user;
  console.log("Current User:", user);

  const [formData, setFormData] = useState({
    name: user?.name,
    email: user?.email,
    // roleId: user?.roleId?._id,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: true,
    darkMode: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    console.log("Settings saved:", formData);
    alert("Settings saved successfully!");
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Settings
        </Typography>

        <Paper sx={{ padding: 4 }}>
          {/* Account Info */}
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Grid container spacing={3} mb={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            {/* <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Role"
                name="roleId"
                value={formData.roleId?._id}
                disabled
              />
            </Grid> */}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Password Section */}
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Grid container spacing={3} mb={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Preferences */}
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
          <Grid container spacing={3} mb={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications}
                    onChange={handleChange}
                    name="notifications"
                  />
                }
                label="Enable Notifications"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.darkMode}
                    onChange={handleChange}
                    name="darkMode"
                  />
                }
                label="Dark Mode"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default Settings;
