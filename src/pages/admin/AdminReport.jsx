import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  MenuItem,
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout";

const AdminReport = () => {
  const [reports, setReports] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  useEffect(() => {
    // Mock reports data
    const mockData = [
      {
        id: "RP-001",
        reporter: "User123",
        target: "Phone Hub",
        type: "Business",
        reason: "Selling counterfeit products",
        date: "2025-03-12",
        status: "Pending",
      },
      {
        id: "RP-002",
        reporter: "User345",
        target: "Samsung Galaxy S10",
        type: "Item",
        reason: "Incorrect specifications",
        date: "2025-04-01",
        status: "Resolved",
      },
      {
        id: "RP-003",
        reporter: "User567",
        target: "Gadget World",
        type: "Business",
        reason: "Scam business",
        date: "2025-04-05",
        status: "Pending",
      },
    ];
    setReports(mockData);
  }, []);

  const filteredReports = reports.filter((report) => {
    const reportDate = new Date(report.date);
    const monthMatch = filterMonth
      ? reportDate.getMonth() + 1 === parseInt(filterMonth)
      : true;
    const yearMatch = filterYear
      ? reportDate.getFullYear().toString() === filterYear
      : true;
    return monthMatch && yearMatch;
  });

  return (
    <MainLayout>
      <Box p={4}>
        <Typography variant="h4" gutterBottom>
          Reports
        </Typography>

        {/* Filter section */}
        <Paper sx={{ padding: 2, marginBottom: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                {[...Array(12)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Year"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                type="number"
                placeholder="2025"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Reports Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report ID</TableCell>
                  <TableCell>Reporter</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.id}</TableCell>
                    <TableCell>{report.reporter}</TableCell>
                    <TableCell>{report.target}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        color={
                          report.status === "Resolved" ? "success" : "warning"
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small">View</Button>
                      {report.status !== "Resolved" && (
                        <Button size="small" color="primary">
                          Mark Resolved
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredReports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No reports found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default AdminReport;
