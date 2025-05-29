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
  Paper,
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
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  Category,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axiosConfig";

const FORM_STATUS_OPTIONS = ["active", "inactive"];

const StatusChip = ({ status }) => {
  return (
    <Chip
      label={status}
      color={status === "active" ? "success" : "error"}
      size="small"
      icon={status === "active" ? <CheckCircle /> : <Cancel />}
    />
  );
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [filter, setFilter] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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

  const filteredCategories = categories?.data?.filter(
    (category) =>
      category.name?.toLowerCase().includes(filter.toLowerCase()) ||
      category.status?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleOpenDialog = (category) => {
    setCurrentCategory(
      category
        ? { ...category }
        : { name: "", status: "active" }
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

  const handleSaveCategory = async () => {
    setDialogLoading(true);
    const isEditing = currentCategory && currentCategory._id;

    try {
      if (isEditing) {
        await api.patch(`api/v1/categories/${currentCategory._id}`, currentCategory);
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

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Categories
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog(null)}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Add Category
          </Button>
        </Box>

        <Card sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <TextField
            variant="outlined"
            label="Search categories..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <Search sx={{ color: "action.active", mr: 1 }} />
              ),
            }}
          />
        </Card>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "background.default" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>slug</TableCell>
                    {/* <TableCell sx={{ fontWeight: 600 }}>Category</TableCell> */}
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories?.length > 0 ? (
                    filteredCategories.map((category) => (
                      <TableRow
                        key={category._id}
                        hover
                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                              <Category />
                            </Avatar>
                            <Typography>{category.name}</Typography>
                          </Box>
                        </TableCell>
                         <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography>{category.slug}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={category.status} />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleOpenDialog(category)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDeleteCategory(category._id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No categories found
                        </Typography>
                        <Button
                          onClick={() => handleOpenDialog(null)}
                          startIcon={<Add />}
                          sx={{ mt: 1 }}
                        >
                          Add New Category
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
            {currentCategory?._id ? "Edit Category" : "Add New Category"}
            <Category sx={{ ml: 1, verticalAlign: "middle" }} />
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              margin="normal"
              label="Name"
              fullWidth
              name="name"
              value={currentCategory?.name || ""}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Status"
              name="status"
              fullWidth
              value={currentCategory?.status || "active"}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            >
              {FORM_STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseDialog}
              color="inherit"
              disabled={dialogLoading}
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
            >
              {currentCategory?._id ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default CategoryManagement;