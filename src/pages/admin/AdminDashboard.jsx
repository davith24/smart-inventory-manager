import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  Avatar,
  ListItemAvatar
} from "@mui/material";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import MainLayout from "../../layouts/MainLayout";
import { Helmet } from "react-helmet";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StoreIcon from '@mui/icons-material/Store';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [topBusinesses, setTopBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const title = "Admin Dashboard";
  const theme = useTheme();

  useEffect(() => {
    const mockStats = {
      users: 1200,
      businesses: 300,
      categories: 20,
      items: 7000,
      growth: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        users: [100, 200, 300, 600, 1200],
        items: [500, 1500, 3000, 7000, 7000],
      },
    };

    const mockTopBusinesses = [
      { name: "Tech Store", itemCount: 1200, color: "#1976d2" },
      { name: "Phone Hub", itemCount: 900, color: "#2e7d32" },
      { name: "Gadget World", itemCount: 850, color: "#f57c00" },
      { name: "ElectroKing", itemCount: 700, color: "#7b1fa2" },
      { name: "SecondZone", itemCount: 670, color: "#c62828" },
    ];

    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setTopBusinesses(mockTopBusinesses);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <Helmet>
          <title>{title}</title>
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
            Loading dashboard data...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  const chartData = stats.growth.labels.map((label, index) => ({
    name: label,
    users: stats.growth.users[index],
    items: stats.growth.items[index],
  }));

  const summaryCards = [
    { 
      title: "Total Users", 
      value: stats.users.toLocaleString(), 
      icon: <PeopleAltIcon />, 
      color: theme.palette.primary.main,
      description: "+12% from last month"
    },
    { 
      title: "Businesses", 
      value: stats.businesses.toLocaleString(), 
      icon: <BusinessIcon />, 
      color: theme.palette.success.main,
      description: "+5% from last month" 
    },
    { 
      title: "Categories", 
      value: stats.categories.toLocaleString(), 
      icon: <CategoryIcon />, 
      color: theme.palette.warning.main,
      description: "Across all businesses" 
    },
    { 
      title: "Total Items", 
      value: stats.items.toLocaleString(), 
      icon: <InventoryIcon />, 
      color: theme.palette.secondary.main,
      description: "+133% from last month" 
    },
  ];

  return (
    <MainLayout>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Box sx={{ padding: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {summaryCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(card.color, 0.1), 
                        color: card.color,
                        marginRight: 2
                      }}
                    >
                      {card.icon}
                    </Avatar>
                    <Typography variant="subtitle1" color="textSecondary">
                      {card.title}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {/* Growth Chart */}
          <Grid item xs={12} lg={8}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <TrendingUpIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium">
                    Growth Trends
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                    <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis tick={{ fill: theme.palette.text.secondary }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        borderRadius: 8,
                        boxShadow: theme.shadows[3]
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke={theme.palette.primary.main} 
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                      name="Users"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="items" 
                      stroke={theme.palette.success.main} 
                      fillOpacity={1} 
                      fill="url(#colorItems)"
                      name="Items" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Businesses */}
          <Grid item xs={12} lg={4}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <StoreIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium">
                    Top Businesses
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {topBusinesses.map((biz, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        py: 1.5,
                        borderRadius: 1,
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05)
                        },
                        mb: 1
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha(biz.color, 0.1), color: biz.color }}>
                          {biz.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={biz.name} 
                        secondary={`Ranked #${index + 1}`}
                      />
                      <Box>
                        <Typography fontWeight="bold" color="primary">
                          {biz.itemCount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          items
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default AdminDashboard;