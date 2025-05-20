import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  useTheme,
  Avatar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip
} from "@mui/material";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axiosConfig";

// Icons
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StorefrontIcon from "@mui/icons-material/Storefront";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Mock Data (replace with actual data fetching logic)
const mockData = {
  totalBusinesses: 12,
  totalCategories: 8,
  totalItems: 56,
  top5Businesses: [
    { name: "Business 1", itemsCount: 15 },
    { name: "Business 2", itemsCount: 12 },
    { name: "Business 3", itemsCount: 10 },
    { name: "Business 4", itemsCount: 8 },
    { name: "Business 5", itemsCount: 6 },
  ],
};

// Navigation Card Component
const NavigationCard = ({ title, icon, to }) => {
  const theme = useTheme();
  
  return (
    <NavLink to={to} style={{ textDecoration: "none" }}>
      <Card 
        sx={{ 
          height: "100%",
          display: "flex",
          alignItems: "center",
          transition: "all 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: theme.shadows[6]
          }
        }}
      >
        <CardContent sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          width: "100%",
          padding: "20px !important"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48,
                marginRight: 2
              }}
            >
              {icon}
            </Avatar>
            <Typography variant="h6" color="textPrimary">
              {title}
            </Typography>
          </Box>
          <ArrowForwardIcon color="action" />
        </CardContent>
      </Card>
    </NavLink>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: "100%",
        boxShadow: theme.shadows[3],
        borderRadius: "12px",
        transition: "all 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: theme.shadows[6]
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: color || theme.palette.primary.main,
              width: 56,
              height: 56
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.user;
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call to fetch dashboard data
    setTimeout(() => {
      setLoading(false); // Stop loading after mock data is loaded
    }, 1000);
  }, []);

  const renderBusinessList = () => (
    <List sx={{ width: "100%" }}>
      {mockData.top5Businesses.map((business, index) => (
        <React.Fragment key={index}>
          <ListItem
            secondaryAction={
              <Tooltip title="More options">
                <IconButton edge="end">
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <StorefrontIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={business.name}
              secondary={`${business.itemsCount} items`}
              primaryTypographyProps={{ fontWeight: "medium" }}
            />
          </ListItem>
          {index < mockData.top5Businesses.length - 1 && (
            <Divider variant="inset" component="li" />
          )}
        </React.Fragment>
      ))}
    </List>
  );

  if (loading) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ padding: { xs: 2, md: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            background: `linear-gradient(75deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            padding: { xs: 3, md: 4 },
            marginBottom: 4,
            borderRadius: "16px"
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Welcome, {user?.name || "User"}!
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.8, mt: 1 }}>
            Here's an overview of your business performance
          </Typography>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Total Businesses" 
              value={mockData.totalBusinesses} 
              icon={<BusinessIcon fontSize="large" />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Total Categories" 
              value={mockData.totalCategories} 
              icon={<CategoryIcon fontSize="large" />}
              color={theme.palette.secondary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Total Items" 
              value={mockData.totalItems} 
              icon={<InventoryIcon fontSize="large" />}
              color="#ff9800" // Orange
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: "12px", height: "100%" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="medium">
                    Top Performing Businesses
                  </Typography>
                  <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Box>
                {renderBusinessList()}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ borderRadius: "12px", mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <NavigationCard 
                      title="Business Management" 
                      icon={<StorefrontIcon />} 
                      to="/client/business-management" 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <NavigationCard 
                      title="Category Management" 
                      icon={<MenuBookIcon />} 
                      to="/client/category-management" 
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default Dashboard;