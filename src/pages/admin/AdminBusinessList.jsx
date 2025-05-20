import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  TablePagination,
  Chip,
  Card,
  CardContent,
  InputAdornment,
  CircularProgress,
  Alert,
  Container,
  IconButton,
  Tooltip
} from "@mui/material";
import { Search, Refresh } from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axiosConfig";

const AdminBusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const rowsPerPage = 10;

  const fetchBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/v1/items");
      setBusinesses(response.data.data);
    } catch (err) {
      console.error("Error fetching businesses:", err);
      setError("Failed to load businesses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const filteredBusinesses = businesses?.data?.filter((business) =>
    business.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "suspended":
        return "warning";
      case "pending":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="xl">
        <Box py={4}>
          <Typography 
            variant="h4" 
            gutterBottom 
            fontWeight="500" 
            color="primary.main"
            sx={{ mb: 3 }}
          >
            Businesses Management
          </Typography>

          <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="text.secondary">
                  Business Directory
                </Typography>
                <Tooltip title="Refresh data">
                  <IconButton onClick={fetchBusinesses} color="primary">
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                placeholder="Search by business name..."
                variant="outlined"
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden" }}>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "grey.100" }}>
                          <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>Business Name</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>Owner</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>Items</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredBusinesses.length > 0 ? (
                          filteredBusinesses
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((business, index) => (
                              <TableRow 
                                key={business._id}
                                sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                              >
                                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                <TableCell sx={{ fontWeight: "medium" }}>{business.name}</TableCell>
                                <TableCell>{business.owner}</TableCell>
                                <TableCell>
                                  {business.category && (
                                    <Chip 
                                      label={business.category} 
                                      size="small"
                                      sx={{ 
                                        backgroundColor: 'primary.light',
                                        color: 'primary.contrastText',
                                        fontWeight: 500
                                      }}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>{business.items}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={business.status}
                                    color={getStatusColor(business.status)}
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                              <Typography variant="body1" color="text.secondary">
                                No businesses found matching your search.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    <TablePagination
                      component="div"
                      count={filteredBusinesses.length}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      rowsPerPage={rowsPerPage}
                      rowsPerPageOptions={[10]}
                      sx={{ borderTop: 1, borderColor: 'divider' }}
                    />
                  </>
                )}
              </Paper>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default AdminBusinessList;