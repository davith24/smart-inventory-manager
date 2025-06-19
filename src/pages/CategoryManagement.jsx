import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
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
    const active =
      categories?.data?.filter((cat) => cat.status === "active")?.length || 0;
    const inactive =
      categories?.data?.filter((cat) => cat.status === "inactive")?.length || 0;
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCategories?.length / itemsPerPage);
  const paginatedCategories = filteredCategories?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <MainLayout>
      <Box sx={{ p: 3, maxWidth: "100%", overflow: "hidden" }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-600 flex items-center gap-2">
            Category Management
          </h1>
          <button
            onClick={() => handleOpenDialog(null)}
            className="bg-primary text-gray-600 px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg hover:-translate-y-1 transition"
          >
            <Add className="mr-2 inline" /> Add Category
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 rounded-xl p-6 text-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">{stats.total}</h2>
                <p className="opacity-90">Total Categories</p>
              </div>
              <Timeline className="text-white text-4xl opacity-70" />
            </div>
          </div>
          <div className="flex-1 rounded-xl p-6 text-white shadow-lg bg-gradient-to-br from-emerald-600 to-green-400">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">{stats.active}</h2>
                <p className="opacity-90">Active Categories</p>
              </div>
              <CheckCircle className="text-white text-4xl opacity-70" />
            </div>
          </div>
          <div className="flex-1 rounded-xl p-6 text-white shadow-lg bg-gradient-to-br from-red-500 to-orange-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">{stats.inactive}</h2>
                <p className="opacity-90">Inactive Categories</p>
              </div>
              <Cancel className="text-white text-4xl opacity-70" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4">
          <div className="flex items-center mb-2">
            <FilterList className="mr-2 text-primary" />
            <h3 className="font-semibold text-lg">Filters</h3>
            {(filter || statusFilter !== "all") && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 text-white text-xs">
                !
              </span>
            )}
          </div>
          <hr className="mb-4" />
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Table */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left font-semibold px-6 py-4">ID</th>
                  <th className="text-left font-semibold px-6 py-4">Name</th>
                  <th className="text-left font-semibold px-6 py-4">Slug</th>
                  <th className="text-left font-semibold px-6 py-4">Status</th>
                  <th className="text-center font-semibold px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories?.length > 0 ? (
                  filteredCategories.map((category, index) => (
                    <tr
                      key={category._id}
                      className={`transition duration-200 ease-in-out hover:bg-gray-50 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold">
                        {category._id?.slice(-6)}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        <span className="">{category.slug || "No slug"}</span>
                      </td>
                      <td className="px-6 py-4">
                        {/* <StatusChip status={category.status} /> */}
                        <span className="text-gren-500 bg-green-100 rounded-full text-center py-2 px-4">
                          {category.status.charAt(0).toUpperCase() +
                            category.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleOpenDialog(category)}
                            className="text-primary hover:bg-primary/10 rounded p-1 transition"
                            title="Edit Category"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="text-red-600 hover:bg-red-100 rounded p-1 transition"
                            title="Delete Category"
                          >
                            <Delete className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 px-6">
                      <div className="flex flex-col items-center justify-center">
                        <Category className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-lg text-gray-500 font-semibold mb-1">
                          No categories found
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                          {filter || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Get started by adding your first category"}
                        </p>
                        <button
                          onClick={() => handleOpenDialog(null)}
                          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90"
                        >
                          <Add className="inline-block mr-1" /> Add New Category
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-between items-center p-4 bg-white">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
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
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              py: 2.5,
            }}
          >
            <Category sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="600">
              {currentCategory?._id ? "Edit Category" : "Add New Category"}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ mt: 4, pt: 4, pb: 2 }}>
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {opt === "active" ? (
                          <CheckCircle
                            sx={{ fontSize: 20, color: "success.main" }}
                          />
                        ) : (
                          <Cancel sx={{ fontSize: 20, color: "error.main" }} />
                        )}
                        {opt.charAt(0).toUpperCase() + opt?.slice(1)}
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
                fontWeight: 600,
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
              fontWeight: 500,
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
