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
  Timeline,
} from "@mui/icons-material";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axiosConfig";
import { formatMoney } from "../components/Format";
import { Plus } from "lucide-react";
import { useControlledValueWithTimezone } from "@mui/x-date-pickers/internals";

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
  const [openDialogStockIn, setOpenDialogStockIn] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [filters, setFilters] = useState({
    id: "",
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
      setCategories(response.data.data);
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
    const idFilter = filters.id.toLowerCase().trim();
    const nameFilter = filters.name.toLowerCase().trim();
    const skuFilter = filters.sku.toLowerCase().trim();
    const categoryIdFilter = filters.categoryId;

    const matchesNameOrId =
      (product.name || "").toLowerCase().includes(nameFilter) ||
      (product._id || "").toLowerCase().includes(idFilter);

    const matchesSKU = (product.sku || "").toLowerCase().includes(skuFilter);

    const matchesCategory = categoryIdFilter
      ? product.categoryId?._id === categoryIdFilter
      : true;

    return matchesNameOrId && matchesSKU && matchesCategory;
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

  const handleOpenDialogStockIn = (product) => {
    setCurrentProduct({
      _id: product._id,
      name: product.name,
      sku: product.sku,
    });
    setOpenDialogStockIn(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProduct(null);
    setDialogLoading(false);
    setOpenDialogStockIn(false);
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

  // Stock in product
  const handleStockInProduct = async () => {
    const quantity = Number(currentProduct?.quantity);

    if (!quantity || quantity <= 0) {
      setNotification({
        open: true,
        message: "Please fill quantity more than 0 as a positive value.",
        severity: "warning",
      });
      return;
    }

    // Update currentProduct's quantity to be a number
    const updatedProduct = {
      ...currentProduct,
      quantity,
    };
    setCurrentProduct(updatedProduct);

    setDialogLoading(true);

    try {
      await api.patch(`api/v1/products/${currentProduct._id}/add-quantity`, {
        addedQuantity: updatedProduct.quantity,
      });

      setNotification({
        open: true,
        message: "Product stock in successfully!",
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

  // Notification handler
  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // Get statistics
  const getStats = () => {
    const total = products?.data?.length || 0;
    const outStock =
      products?.data?.filter((pro) => pro.quantity === 0).length || 0;
    const lowStock =
      products?.data?.filter((pro) => pro.reorderLevel >= pro.quantity)
        .length || 0;

    return { total, outStock, lowStock };
  };

  const stats = getStats();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProducts?.length / itemsPerPage);
  const paginatedProducts = filteredProducts?.slice(
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
            Products Management
          </h1>
          <button
            onClick={() => handleOpenDialog(null)}
            className="bg-primary text-gray-600 px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg hover:-translate-y-1 transition"
          >
            <Add className="mr-2 inline" /> Add New Product
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 rounded-xl p-6 text-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">{stats.total}</h2>
                <p className="opacity-90">Total Products</p>
              </div>
              <Timeline className="text-white text-4xl opacity-70" />
            </div>
          </div>
          <div className="flex-1 rounded-xl p-6 text-white shadow-lg bg-gradient-to-br from-yellow-500 to-orange-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">{stats.lowStock}</h2>
                <p className="opacity-90">Low in Stock</p>
              </div>
              <Cancel className="text-white text-4xl opacity-70" />
            </div>
          </div>
          <div className="flex-1 rounded-xl p-6 text-white shadow-lg bg-gradient-to-br from-orange-500 to-red-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">{stats.outStock}</h2>
                <p className="opacity-90">Out of Stock</p>
              </div>
              <CheckCircle className="text-white text-4xl opacity-70" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4">
          <div className="flex items-center mb-2">
            <FilterList className="mr-2 text-primary" />
            <h3 className="font-semibold text-lg">Filters</h3>
            {(filters.name || filters.sku || filters.categoryId) && (
              <span className="ml-2 w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </div>
          <hr className="mb-4" />
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search by name */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="name"
                  placeholder="Search by name..."
                  value={filters.name}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Search by SKU */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="sku"
                  placeholder="Search by SKU..."
                  value={filters.sku}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="flex-1">
              <select
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {categories?.data?.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Table */}
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
                  <th className="text-left font-semibold px-6 py-4">SKU</th>
                  <th className="text-left font-semibold px-6 py-4">
                    Category
                  </th>
                  <th className="text-left font-semibold px-6 py-4">Cost</th>
                  <th className="text-left font-semibold px-6 py-4">Price</th>
                  <th className="text-left font-semibold px-6 py-4">
                    Stock Status
                  </th>
                  <th className="text-left font-semibold px-6 py-4">
                    Reorder Level
                  </th>
                  <th className="text-center font-semibold px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts?.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <tr
                      key={product._id}
                      className={`transition duration-200 ease-in-out hover:bg-gray-50 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4">
                        {/* <div className="flex items-center">
                          <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                            <Inventory className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {product._id.slice(-6)}
                            </div>
                          </div>
                        </div> */}
                        {product._id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4 font-medium">{product.sku}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-medium border rounded-full border-primary text-primary">
                          {product.categoryId?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {formatMoney(product.cost)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        {formatMoney(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        {/* Replace with your custom StockIndicator */}
                        <StockIndicator
                          quantity={product.quantity}
                          reorderLevel={product.reorderLevel}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {product.reorderLevel}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleOpenDialogStockIn(product)}
                            className="text-primary hover:bg-green-100 rounded p-1 transition"
                            title="Edit Product"
                          >
                            <Plus className="w-5 h-5 text-green-500" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(product)}
                            className="text-primary hover:bg-orange-100 rounded p-1 transition"
                            title="Edit Product"
                          >
                            <Edit className="w-5 h-5 text-orange-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:bg-red-100 rounded p-1 transition"
                            title="Delete Product"
                          >
                            <Delete className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12 px-6">
                      <div className="flex flex-col items-center justify-center">
                        <Inventory className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-lg text-gray-500 font-semibold mb-1">
                          No products found
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                          {Object.values(filters).some((f) => f)
                            ? "Try adjusting your filters"
                            : "Get started by adding your first product"}
                        </p>
                        <button
                          onClick={() => handleOpenDialog(null)}
                          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90"
                        >
                          <Add className="inline-block mr-1" /> Add New Product
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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

        {/* Product Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
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
                fontWeight: 600,
              }}
            >
              {currentProduct?._id ? "Update Product" : "Create Product"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Stock In Product */}
        <Dialog
          open={openDialogStockIn}
          onClose={handleOpenDialogStockIn}
          fullWidth
          maxWidth="md"
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
              mb: 8,
            }}
          >
            <Inventory sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="600" component="span">
              Add Stock In
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 2 }}>
            <Stack spacing={3}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  name="name"
                  value={currentProduct?.name || ""}
                  disabled
                />
                <TextField
                  fullWidth
                  name="sku"
                  value={currentProduct?.sku || ""}
                  disabled
                  required
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Stock Quantity"
                  fullWidth
                  type="number"
                  name="quantity"
                  value={currentProduct?.quantity || 0}
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
              onClick={handleStockInProduct}
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
              Add Stock In
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

export default ProductManagement;
