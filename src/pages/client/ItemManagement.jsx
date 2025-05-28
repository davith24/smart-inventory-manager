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
  Select,
  InputAdornment,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  Inventory,
  CheckCircle,
  Cancel,
  Warning,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axiosConfig";

const LOW_STOCK_THRESHOLD = 10;

const StockIndicator = ({ quantity, reorderLevel }) => {
  if (quantity === 0) {
    return (
      <Chip
        label="Out of stock"
        color="error"
        size="small"
        icon={<Cancel />}
      />
    );
  } else if (quantity <= reorderLevel) {
    return (
      <Chip
        label={`Low stock (${quantity})`}
        color="warning"
        size="small"
        icon={<Warning />}
      />
    );
  }
  return (
    <Chip
      label={`In stock (${quantity})`}
      color="success"
      size="small"
      icon={<CheckCircle />}
    />
  );
};

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    sku: "",
    categoryId: "",
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("api/v1/products");
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setNotification({
        open: true,
        message: `Failed to fetch products: ${error.message || "Unknown error"}`,
        severity: "error",
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
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
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products?.data?.filter((product) => {
    const matchesName = product.name?.toLowerCase().includes(filters.name.toLowerCase());
    const matchesSKU = product.sku?.toLowerCase().includes(filters.sku.toLowerCase());
    const matchesCategory = filters.categoryId ? product.categoryId === filters.categoryId : true;
    
    return matchesName && matchesSKU && matchesCategory;
  });

  const handleOpenDialog = (product) => {
    setCurrentProduct(
      product
        ? { ...product }
        : { 
            name: "", 
            sku: "",
            categoryId: categories.data?.[0]?._id || "",
            quantity: 0,
            reorderLevel: 0,
            price: 0,
            cost: 0
          }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProduct(null);
    setDialogLoading(false);
  };

  const handleDialogInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleSaveProduct = async () => {
    setDialogLoading(true);
    const isEditing = currentProduct && currentProduct._id;

    try {
      if (isEditing) {
        await api.patch(`api/v1/products/${currentProduct._id}`, currentProduct);
      } else {
        const { _id, ...newProduct } = currentProduct;
        await api.post("api/v1/products", newProduct);
      }

      setNotification({
        open: true,
        message: isEditing
          ? "Product updated successfully!"
          : "New product added successfully!",
        severity: "success",
      });
      handleCloseDialog();
      await fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      setNotification({
        open: true,
        message: `Failed to save product: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`,
        severity: "error",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.delete(`api/v1/products/${id}`);
      setNotification({
        open: true,
        message: "Product deleted successfully!",
        severity: "success",
      });
      await fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      setNotification({
        open: true,
        message: `Failed to delete product: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`,
        severity: "error",
      });
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
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
            Product Inventory
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
            Add Product
          </Button>
        </Box>

        <Card sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              variant="outlined"
              label="Search by name"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
            />
            <TextField
              variant="outlined"
              label="Search by SKU"
              name="sku"
              value={filters.sku}
              onChange={handleFilterChange}
              sx={{ flex: 1 }}
            />
            <Select
              label="Category"
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              displayEmpty
              sx={{ flex: 1 }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories?.data?.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
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
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Cost</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts?.length > 0 ? (
                    filteredProducts.map((product) => {
                      const category = categories.data?.find(c => c._id === product.categoryId);
                      return (
                        <TableRow
                          key={product._id}
                          hover
                          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                                <Inventory />
                              </Avatar>
                              <Typography fontWeight="medium">{product.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {product.sku}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={category?.name || 'Uncategorized'} 
                              size="small" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            ${product.price?.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            ${product.cost?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <StockIndicator 
                              quantity={product.quantity} 
                              reorderLevel={product.reorderLevel} 
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton
                                onClick={() => handleOpenDialog(product)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                onClick={() => handleDeleteProduct(product._id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No products found
                        </Typography>
                        <Button
                          onClick={() => handleOpenDialog(null)}
                          startIcon={<Add />}
                          sx={{ mt: 1 }}
                        >
                          Add New Product
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
            {currentProduct?._id ? "Edit Product" : "Add New Product"}
            <Inventory sx={{ ml: 1, verticalAlign: "middle" }} />
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              margin="normal"
              label="Product Name"
              fullWidth
              name="name"
              value={currentProduct?.name || ""}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              label="SKU"
              fullWidth
              name="sku"
              value={currentProduct?.sku || ""}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            />
            <Select
              label="Category"
              name="categoryId"
              fullWidth
              value={currentProduct?.categoryId || ""}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            >
              {categories?.data?.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Price"
                fullWidth
                type="number"
                name="price"
                value={currentProduct?.price || 0}
                onChange={handleDialogInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                label="Cost"
                fullWidth
                type="number"
                name="cost"
                value={currentProduct?.cost || 0}
                onChange={handleDialogInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Quantity"
                fullWidth
                type="number"
                name="quantity"
                value={currentProduct?.quantity || 0}
                onChange={handleDialogInputChange}
              />
              <TextField
                label="Reorder Level"
                fullWidth
                type="number"
                name="reorderLevel"
                value={currentProduct?.reorderLevel || 0}
                onChange={handleDialogInputChange}
              />
            </Box>
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
              onClick={handleSaveProduct}
              color="primary"
              variant="contained"
              disabled={dialogLoading}
              startIcon={
                dialogLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {currentProduct?._id ? "Update" : "Create"}
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

export default InventoryManagement;