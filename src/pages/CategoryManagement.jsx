import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  CircularProgress,
  IconButton,
  Alert,
  Tooltip,
  Avatar,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Divider,
  Stack,
  Badge,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  Category,
  CheckCircle,
  Cancel,
  FilterList,
  Clear,
  Label,
  Timeline,
} from "@mui/icons-material";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axiosConfig";

const FORM_STATUS_OPTIONS = ["active", "inactive"];

// Enhanced Status Chip Component
const StatusChip = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          color: "success",
          icon: <CheckCircle />,
          bgColor: "success.light",
        };
      case "inactive":
        return {
          label: "Inactive",
          color: "error",
          icon: <Cancel />,
          bgColor: "error.light",
        };
      default:
        return {
          label: status,
          color: "default",
          icon: <Label />,
          bgColor: "grey.300",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      icon={config.icon}
      sx={{
        fontWeight: 600,
        textTransform: "capitalize",
        "& .MuiChip-icon": {
          fontSize: "1rem",
        },
      }}
    />
  );
};

const CategoryManagement = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // API calls
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("api/v1/categories");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setNotification({
        open: true,
        message: `Failed to fetch categories: ${error.message || "Unknown error"}`,
        severity: "error",
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories based on search and status
  const filteredCategories = categories?.data?.filter((category) => {
    const matchesSearch =
      category._id?.toLowerCase().includes(filter.toLowerCase()) ||
      category.name?.toLowerCase().includes(filter.toLowerCase()) ||
      category.slug?.toLowerCase().includes(filter.toLowerCase()) ||
      category.status?.toLowerCase().includes(filter.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || category.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get statistics
  const getStats = () => {
    const total = categories?.data?.length || 0;
    const active = categories?.data?.filter(cat => cat.status === "active").length || 0;
    const inactive = categories?.data?.filter(cat => cat.status === "inactive").length || 0;
    return { total, active, inactive };
  };

  const stats = getStats();

  // Dialog handlers
  const handleOpenDialog = (category) => {
    setCurrentCategory(
      category ? { ...category } : { name: "", status: "active" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCategory(null);
    setDialogLoading(false);
  };

  const handleDialogInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentCategory((prevCategory) => ({
      ...prevCategory,
      [name]: value,
    }));
  };

  // Save category (create or update)
  const handleSaveCategory = async () => {
    if (!currentCategory?.name?.trim()) {
      setNotification({
        open: true,
        message: "Please enter a category name.",
        severity: "warning",
      });
      return;
    }

    setDialogLoading(true);
    const isEditing = currentCategory && currentCategory._id;

    try {
      if (isEditing) {
        await api.patch(
          `api/v1/categories/${currentCategory._id}`,
          currentCategory
        );
      } else {
        const { _id, ...newCategory } = currentCategory;
        await api.post("api/v1/categories", newCategory);
      }

      setNotification({
        open: true,
        message: isEditing
          ? "Category updated successfully!"
          : "New category added successfully!",
        severity: "success",
      });
      handleCloseDialog();
      await fetchCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      setNotification({
        open: true,
        message: `Failed to save category: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`,
        severity: "error",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await api.delete(`api/v1/categories/${id}`);
      setNotification({
        open: true,
        message: "Category deleted successfully!",
        severity: "success",
      });
      await fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      setNotification({
        open: true,
        message: `Failed to delete category: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`,
        severity: "error",
      });
    }
  };

  // Filter handlers
  const clearFilters = () => {
    setFilter("");
    setStatusFilter("all");
  };

  // Notification handler
  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3, maxWidth: "100%", overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <Category />
            Category Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog(null)}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: 2,
              "&:hover": { 
                boxShadow: 4,
                transform: "translateY(-2px)",
                transition: "all 0.2s ease-in-out"
              },
            }}
          >
            Add Category
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={2} 
          sx={{ mb: 3 }}
        >
          <Card 
            sx={{ 
              p: 2.5, 
              flex: 1, 
              borderRadius: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)"
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Categories
                </Typography>
              </Box>
              <Timeline sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Card>

          <Card 
            sx={{ 
              p: 2.5, 
              flex: 1, 
              borderRadius: 3,
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              color: "white",
              boxShadow: "0 4px 20px rgba(17, 153, 142, 0.3)"
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.active}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Active Categories
                </Typography>
              </Box>
              <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Card>

          <Card 
            sx={{ 
              p: 2.5, 
              flex: 1, 
              borderRadius: 3,
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
              color: "white",
              boxShadow: "0 4px 20px rgba(255, 107, 107, 0.3)"
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.inactive}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Inactive Categories
                </Typography>
              </Box>
              <Cancel sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </Card>
        </Stack>

        {/* Filters */}
        <Card 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid",
            borderColor: "grey.200"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FilterList sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
            {(filter || statusFilter !== "all") && (
              <Badge 
                badgeContent="!" 
                color="primary" 
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Stack 
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="flex-end"
          >
            <TextField
              variant="outlined"
              label="Search categories..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "action.active" }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                label="Status Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="inactive">Inactive Only</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<Clear />}
              sx={{ minWidth: "auto", px: 2 }}
            >
              Clear
            </Button>
          </Stack>
        </Card>

        {/* Category Table */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Card 
            sx={{ 
              borderRadius: 3, 
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              border: "1px solid",
              borderColor: "grey.200"
            }}
          >
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Category
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Slug
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Status
                    </TableCell>
                    <TableCell 
                      sx={{ fontWeight: 700, bgcolor: "grey.50" }}
                      align="center"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories?.length > 0 ? (
                    filteredCategories.map((category, index) => (
                      <TableRow
                        key={category._id}
                        hover
                        sx={{
                          "&:hover": {
                            bgcolor: "action.hover",
                            transform: "scale(1.002)",
                            transition: "all 0.2s ease-in-out"
                          },
                          bgcolor: index % 2 === 0 ? "grey.25" : "white"
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: "primary.main", 
                                mr: 2,
                                width: 40,
                                height: 40
                              }}
                            >
                              <Category />
                            </Avatar>
                            <Box>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ fontSize: "0.75rem" }}
                              >
                                ID: {category._id.slice(-6)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="600" variant="body2">
                            {category.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={category.slug || "No slug"}
                            size="small"
                            variant="outlined"
                            color="secondary"
                            sx={{ 
                              fontWeight: 500,
                              fontFamily: "monospace",
                              fontSize: "0.75rem"
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusChip status={category.status} />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Edit Category">
                              <IconButton
                                onClick={() => handleOpenDialog(category)}
                                color="primary"
                                size="small"
                                sx={{
                                  "&:hover": {
                                    bgcolor: "primary.light",
                                    color: "white"
                                  }
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Category">
                              <IconButton
                                onClick={() => handleDeleteCategory(category._id)}
                                color="error"
                                size="small"
                                sx={{
                                  "&:hover": {
                                    bgcolor: "error.light",
                                    color: "white"
                                  }
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <Category 
                            sx={{ 
                              fontSize: 60, 
                              color: "grey.400", 
                              mb: 2 
                            }} 
                          />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No categories found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {filter || statusFilter !== "all" 
                              ? "Try adjusting your filters" 
                              : "Get started by adding your first category"
                            }
                          </Typography>
                          <Button
                            onClick={() => handleOpenDialog(null)}
                            startIcon={<Add />}
                            variant="contained"
                            sx={{ textTransform: "none" }}
                          >
                            Add New Category
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Category Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)"
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              bgcolor: "primary.main", 
              color: "white",
              display: "flex",
              alignItems: "center",
              py: 2.5
            }}
          >
            <Category sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="600">
              {currentCategory?._id ? "Edit Category" : "Add New Category"}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Stack spacing={3}>
              <TextField
                label="Category Name *"
                fullWidth
                name="name"
                value={currentCategory?.name || ""}
                onChange={handleDialogInputChange}
                required
                autoFocus
                placeholder="Enter category name..."
                helperText="This will be used to identify the category"
              />
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={currentCategory?.status || "active"}
                  onChange={handleDialogInputChange}
                  label="Status"
                >
                  {FORM_STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {opt === "active" ? (
                          <CheckCircle sx={{ fontSize: 20, color: "success.main" }} />
                        ) : (
                          <Cancel sx={{ fontSize: 20, color: "error.main" }} />
                        )}
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button
              onClick={handleCloseDialog}
              color="inherit"
              disabled={dialogLoading}
              sx={{ textTransform: "none", px: 3 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              color="primary"
              variant="contained"
              disabled={dialogLoading}
              startIcon={
                dialogLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
              sx={{ 
                textTransform: "none", 
                px: 4,
                fontWeight: 600
              }}
            >
              {currentCategory?._id ? "Update Category" : "Create Category"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ 
              width: "100%",
              borderRadius: 2,
              fontWeight: 500
            }}
            elevation={6}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default CategoryManagement;