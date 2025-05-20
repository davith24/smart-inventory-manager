import React from "react";
import { Box, Typography, Grid, Paper, Card, CardContent } from "@mui/material";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import MainLayout from "../../layouts/MainLayout";

const AdminAnalysis = () => {
  // Mock summary data
  const summaryData = [
    { title: "Total Users", value: 1200 },
    { title: "Total Businesses", value: 480 },
    { title: "Total Items", value: 3100 },
    { title: "Reports This Month", value: 34 },
  ];

  // Mock growth data
  const growthData = [
    { month: "Jan", users: 200, businesses: 80, items: 500 },
    { month: "Feb", users: 300, businesses: 120, items: 750 },
    { month: "Mar", users: 400, businesses: 160, items: 900 },
    { month: "Apr", users: 500, businesses: 200, items: 1100 },
  ];

  // Mock category distribution
  const categoryData = [
    { name: "Electronics", value: 1200 },
    { name: "Furniture", value: 600 },
    { name: "Clothing", value: 400 },
    { name: "Vehicles", value: 900 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Mock business activity (e.g. top reported or active)
  const barData = [
    { name: "Gadget Zone", reports: 12 },
    { name: "Furniture Mart", reports: 8 },
    { name: "Auto Center", reports: 15 },
    { name: "Style Corner", reports: 4 },
  ];

  return (
    <MainLayout>
      <Box p={4}>
        <Typography variant="h4" gutterBottom>
          Platform Analysis
        </Typography>

        {/* Summary cards */}
        <Grid container spacing={3} sx={{ marginBottom: 3 }}>
          {summaryData.map((data, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    {data.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {data.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Growth Chart */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>
            Growth Over Time
          </Typography>
          <LineChart width={800} height={300} data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#8884d8" />
            <Line type="monotone" dataKey="businesses" stroke="#82ca9d" />
            <Line type="monotone" dataKey="items" stroke="#ffc658" />
          </LineChart>
        </Paper>

        {/* Category Distribution + Business Reports */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom>
                Category Distribution
              </Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom>
                Most Reported Businesses
              </Typography>
              <BarChart width={400} height={300} data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reports" fill="#f44336" />
              </BarChart>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default AdminAnalysis;
