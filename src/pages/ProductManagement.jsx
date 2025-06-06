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
  Select,
  InputAdornment,
  FormControl,
  InputLabel,
  Divider,
  Stack,
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
  FilterList,
} from "@mui/icons-material";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axiosConfig";
import { formatMoney } from "../components/Format";

const LOW_STOCK_THRESHOLD = 10;

// Stock indicator component with improved styling
const StockIndicator = ({ quantity, reorderLevel }) => {
  if (quantity === 0) {
    return (
      <Chip 
        label="Out of stock" 
        color="error" 
        size="small" 
        icon={<Cancel />}
        sx={{ fontWeight: 600 }}
      />
    );
  } else if (quantity <= reorderLevel) {
    return (
      <Chip
        label={`Low stock (${quantity})`}
        color="warning"
        size="small"
        icon={<Warning />}
        sx={{ fontWeight: 600 }}
      />
    );
  }
  return (
    <Chip
      label={`In stock (${quantity})`}
      color="success"
      size="small"
      icon={<CheckCircle />}
      sx={{ fontWeight: 600 }}
    />
  );
};

const ProductManagement = () => {
  // State management
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

  // API calls
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
      setCategories(response.data.data );
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

  // Filter products based on search criteria
  const filteredProducts = products?.data?.filter((product) => {
    const matchesName = product.name
      ?.toLowerCase()
      .includes(filters.name.toLowerCase());
    const matchesSKU = product.sku
      ?.toLowerCase()
      .includes(filters.sku.toLowerCase());
    const matchesCategory = filters.categoryId
      ? product.categoryId._id === filters.categoryId
      : true;

    return matchesName && matchesSKU && matchesCategory;
  });

  // Dialog handlers
  const handleOpenDialog = (product) => {
    setCurrentProduct(
      product
        ? {
            ...product,
            categoryId: product.categoryId?._id || "",
          }
        : {
            name: "",
            sku: "",
            categoryId: "",
            quantity: 0,
            reorderLevel: 0,
            price: 0,
            cost: 0,
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

  // Save product (create or update)
  const handleSaveProduct = async () => {
    if (!currentProduct?.name || !currentProduct?.sku) {
      setNotification({
        open: true,
        message: "Please fill in all required fields (Name and SKU).",
        severity: "warning",
      });
      return;
    }

    setDialogLoading(true);
    const isEditing = currentProduct && currentProduct._id;

    try {
      if (isEditing) {
        await api.patch(
          `api/v1/products/${currentProduct._id}`,
          currentProduct
        );
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

  // Delete product
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

  // Filter handlers
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      sku: "",
      categoryId: "",
    });
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
            <Inventory />
            Product Management
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
            Add Product
          </Button>
        </Box>

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
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Stack 
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="flex-end"
          >
            <TextField
              variant="outlined"
              label="Search by name"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "action.active" }} />
                  </InputAdornment>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "action.active" }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories?.data?.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{ minWidth: "auto", px: 2 }}
            >
              Clear
            </Button>
          </Stack>
        </Card>

        {/* Product Table */}
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
                      Product
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      SKU
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Category
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Stock Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Reorder Level
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Price
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>
                      Cost
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
                  {filteredProducts?.length > 0 ? (
                    filteredProducts.map((product, index) => (
                      <TableRow
                        key={product._id}
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
                              <Inventory />
                            </Avatar>
                            <Box>
                              <Typography fontWeight="600" variant="body2">
                                {product.name}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ fontSize: "0.75rem" }}
                              >
                                ID: {product._id.slice(-6)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="500">
                            {product.sku}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.categoryId?.name || "Uncategorized"}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <StockIndicator
                            quantity={product.quantity}
                            reorderLevel={product.reorderLevel}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="500">
                            {product.reorderLevel}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="600" color="success.main">
                            {formatMoney(product.price)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="500" color="text.secondary">
                            {formatMoney(product.cost)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Edit Product">
                              <IconButton
                                onClick={() => handleOpenDialog(product)}
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
                            <Tooltip title="Delete Product">
                              <IconButton
                                onClick={() => handleDeleteProduct(product._id)}
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
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <Inventory 
                            sx={{ 
                              fontSize: 60, 
                              color: "grey.400", 
                              mb: 2 
                            }} 
                          />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No products found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {Object.values(filters).some(f => f) 
                              ? "Try adjusting your filters" 
                              : "Get started by adding your first product"
                            }
                          </Typography>
                          <Button
                            onClick={() => handleOpenDialog(null)}
                            startIcon={<Add />}
                            variant="contained"
                            sx={{ textTransform: "none" }}
                          >
                            Add New Product
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

        {/* Product Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
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
            <Inventory sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="600">
              {currentProduct?._id ? "Edit Product" : "Add New Product"}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Stack spacing={3}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Product Name *"
                  fullWidth
                  name="name"
                  value={currentProduct?.name || ""}
                  onChange={handleDialogInputChange}
                  required
                />
                <TextField
                  label="SKU *"
                  fullWidth
                  name="sku"
                  value={currentProduct?.sku || ""}
                  onChange={handleDialogInputChange}
                  required
                />
              </Stack>
              
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="categoryId"
                  value={currentProduct?.categoryId || ""}
                  onChange={handleDialogInputChange}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories?.data?.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Price"
                  fullWidth
                  type="number"
                  name="price"
                  value={currentProduct?.price || ""}
                  onChange={handleDialogInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Cost"
                  fullWidth
                  type="number"
                  name="cost"
                  value={currentProduct?.cost || ""}
                  onChange={handleDialogInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Stock Quantity"
                  fullWidth
                  type="number"
                  name="quantity"
                  value={currentProduct?.quantity || ""}
                  onChange={handleDialogInputChange}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Reorder Level"
                  fullWidth
                  type="number"
                  name="reorderLevel"
                  value={currentProduct?.reorderLevel || ""}
                  onChange={handleDialogInputChange}
                  inputProps={{ min: 0 }}
                />
              </Stack>
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
              onClick={handleSaveProduct}
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
              {currentProduct?._id ? "Update Product" : "Create Product"}
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

export default ProductManagement;