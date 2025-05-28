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
  Tooltip,
  Button
} from "@mui/material";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axiosConfig";

// Icons
import InventoryIcon from "@mui/icons-material/Inventory";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import WarningIcon from "@mui/icons-material/Warning";
import AddIcon from "@mui/icons-material/Add";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

// Mock Data (replace with actual data fetching logic)
const mockData = {
  totalProducts: 156,
  salesToday: 24,
  lowStockItems: 8,
  recentSales: [
    { id: "#1001", product: "Product A", amount: "$120.00", time: "10:30 AM" },
    { id: "#1002", product: "Product B", amount: "$85.50", time: "11:45 AM" },
    { id: "#1003", product: "Product C", amount: "$210.00", time: "1:15 PM" },
    { id: "#1004", product: "Product D", amount: "$65.25", time: "2:30 PM" },
    { id: "#1005", product: "Product A", amount: "$120.00", time: "3:45 PM" },
  ],
  lowStockProducts: [
    { name: "Product X", stock: 2, threshold: 5 },
    { name: "Product Y", stock: 3, threshold: 10 },
    { name: "Product Z", stock: 1, threshold: 3 },
  ]
};

// Quick Action Button Component
const QuickActionButton = ({ title, icon, to, color }) => {
  const theme = useTheme();
  
  return (
    <NavLink to={to} style={{ textDecoration: "none" }}>
      <Button
        variant="contained"
        color={color || "primary"}
        startIcon={icon}
        fullWidth
        sx={{
          height: 80,
          display: "flex",
          justifyContent: "flex-start",
          paddingLeft: 3,
          fontSize: "1rem",
          textTransform: "none",
          borderRadius: "12px",
          boxShadow: theme.shadows[2],
          transition: "all 0.3s",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: theme.shadows[4]
          }
        }}
      >
        {title}
      </Button>
    </NavLink>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend }) => {
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
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon fontSize="small" color="success" />
                <Typography variant="caption" color="success.main" ml={0.5}>
                  {trend}
                </Typography>
              </Box>
            )}
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

  const renderRecentSales = () => (
    <List sx={{ width: "100%" }}>
      {mockData.recentSales.map((sale, index) => (
        <React.Fragment key={index}>
          <ListItem
            secondaryAction={
              <Typography variant="body2" color="textSecondary">
                {sale.time}
              </Typography>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                <PointOfSaleIcon color="success" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${sale.id} - ${sale.product}`}
              secondary={sale.amount}
              primaryTypographyProps={{ fontWeight: "medium" }}
              secondaryTypographyProps={{ color: "success.main", fontWeight: "medium" }}
            />
          </ListItem>
          {index < mockData.recentSales.length - 1 && (
            <Divider variant="inset" component="li" />
          )}
        </React.Fragment>
      ))}
    </List>
  );

  const renderLowStockItems = () => (
    <List sx={{ width: "100%" }}>
      {mockData.lowStockProducts.map((product, index) => (
        <React.Fragment key={index}>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
                <WarningIcon color="warning" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={product.name}
              secondary={`${product.stock} left (threshold: ${product.threshold})`}
              primaryTypographyProps={{ fontWeight: "medium" }}
              secondaryTypographyProps={{ color: "warning.main" }}
            />
            <Button 
              variant="outlined" 
              size="small" 
              color="warning"
              startIcon={<LocalShippingIcon />}
            >
              Reorder
            </Button>
          </ListItem>
          {index < mockData.lowStockProducts.length - 1 && (
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
            Welcome back, {user?.name || "User"}!
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.8, mt: 1 }}>
            Here's what's happening with your business today
          </Typography>
        </Paper>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Total Products" 
              value={mockData.totalProducts} 
              icon={<InventoryIcon fontSize="large" />}
              color={theme.palette.primary.main}
              trend="+12% this month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Sales Today" 
              value={mockData.salesToday} 
              icon={<PointOfSaleIcon fontSize="large" />}
              color={theme.palette.success.main}
              trend="+5 from yesterday"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard 
              title="Low Stock Items" 
              value={mockData.lowStockItems} 
              icon={<WarningIcon fontSize="large" />}
              color={theme.palette.warning.main}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: "12px", height: "100%" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="medium">
                    Recent Sales
                  </Typography>
                  <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                    <TrendingUpIcon color="success" />
                  </Avatar>
                </Box>
                {renderRecentSales()}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: "12px", mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <QuickActionButton 
                      title="Add New Product" 
                      icon={<AddIcon />} 
                      to="/products/add" 
                      color="primary"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <QuickActionButton 
                      title="Record a Sale" 
                      icon={<PointOfSaleIcon />} 
                      to="/sales/new" 
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <QuickActionButton 
                      title="View Reports" 
                      icon={<AssessmentIcon />} 
                      to="/reports" 
                      color="info"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card sx={{ borderRadius: "12px" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="medium">
                    Low Stock Items
                  </Typography>
                  <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
                    <WarningIcon color="warning" />
                  </Avatar>
                </Box>
                {renderLowStockItems()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default Dashboard;