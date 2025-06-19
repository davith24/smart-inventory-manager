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
  Chip,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Stack,
  Container,
} from "@mui/material";
import {
  Search,
  Add,
  Receipt,
  Visibility,
  Delete,
  AttachMoney,
  Person,
  CalendarToday,
  ShoppingCart,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axiosConfig";
import { formatDate, formatMoney } from "../components/Format";

const SalesManagement = () => {
  // State Management
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);
  const [filter, setFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [productFilter, setProductFilter] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // New Sale State
  const [newSale, setNewSale] = useState({
    customerId: "",
    customerName: "",
    customerPhone: "",
    saleDate: new Date(),
    products: [],
  });

  // API Calls
  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("api/v1/sales");
      setSales(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      setNotification({
        open: true,
        message: `Failed to fetch sales: ${error.message || "Unknown error"}`,
        severity: "error",
      });
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
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
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await api.get("api/v1/customers");
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setNotification({
        open: true,
        message: `Failed to fetch customers: ${error.message || "Unknown error"}`,
        severity: "error",
      });
      setCustomers([]);
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
    const initializeData = async () => {
      await Promise.all([
        fetchSales(),
        fetchProducts(),
        fetchCustomers(),
        fetchCategories(),
      ]);
    };
    initializeData();
  }, [fetchSales, fetchProducts, fetchCustomers, fetchCategories]);

  // Computed Values
  const filteredSales = sales?.data?.filter((sale) => {
    const matchesDate = dateFilter
      ? new Date(sale.saleDate).toDateString() ===
        new Date(dateFilter).toDateString()
      : true;
    const matchesProduct = productFilter
      ? sale.products.some((item) => item.productId === productFilter)
      : true;
    const matchesCustomer = filter
      ? (sale?.customerId?.name || sale.name || "")
          .toLowerCase()
          .includes(filter.toLowerCase())
      : true;

    return matchesDate && matchesProduct && matchesCustomer;
  });

  // Event Handlers
  const handleOpenDialog = (sale) => {
    setCurrentSale(sale);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSale(null);
  };

  const handleOpenCreateDialog = () => {
    setNewSale({
      customerId: "",
      customerName: "",
      customerPhone: "",
      saleDate: new Date(),
      products: [],
    });
    setSelectedCategory("");
    setSelectedProduct("");
    setProductQuantity(1);
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleAddProduct = () => {
    if (!selectedProduct || productQuantity <= 0) return;

    setNewSale((prev) => {
      const existing = prev.products.find(
        (p) => p.productId === selectedProduct
      );
      const updatedProducts = existing
        ? prev.products.map((p) =>
            p.productId === selectedProduct
              ? { ...p, quantity: p.quantity + productQuantity }
              : p
          )
        : [
            ...prev.products,
            { productId: selectedProduct, quantity: productQuantity },
          ];
      return { ...prev, products: updatedProducts };
    });

    setSelectedProduct("");
    setProductQuantity(1);
  };

  const handleRemoveProduct = (productId) => {
    setNewSale((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.productId !== productId),
    }));
  };

  const handleCreateSale = async () => {
    try {
      setDialogLoading(true);
      const payload = {
        saleDate: newSale.saleDate,
        products: newSale.products,
        ...(newSale.customerId
          ? { customerId: newSale.customerId }
          : {
              name: newSale.customerName,
              phone: newSale.customerPhone,
            }),
      };

      await api.post("/api/v1/sales", payload);
      setNotification({
        open: true,
        message: "Sale created successfully!",
        severity: "success",
      });

      fetchSales();
      handleCloseCreateDialog();
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to create sale: ${
          error.response?.data?.message || error.message
        }`,
        severity: "error",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const getProductDetails = (id) => products?.data?.find((p) => p._id === id);

  const calculateTotalAmount = () => {
    return newSale.products.reduce((total, item) => {
      const product = getProductDetails(item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") return;
    setNotification({ ...notification, open: false });
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  mb: 1,
                }}
              >
                Sales Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and track all your sales transactions
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              onClick={handleOpenCreateDialog}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              New Sale
            </Button>
          </Stack>
        </Box>

        {/* Filters Section */}
        <Card
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            boxShadow: 2,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Filters
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                variant="outlined"
                label="Search by customer"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <Search sx={{ color: "action.active", mr: 1 }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "white",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Filter by date"
                  value={dateFilter}
                  onChange={(date) => setDateFilter(date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          backgroundColor: "white",
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Filter by product"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "white",
                  },
                }}
              >
                <MenuItem value="">All Products</MenuItem>
                {products?.data?.map((product) => (
                  <MenuItem key={product._id} value={product._id}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Card>

        {/* Sales Table */}
        <Card
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: 3,
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
              }}
            >
              <CircularProgress size={60} />
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "primary.main",
                      "& th": {
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      },
                    }}
                  >
                    <TableCell>Invoice ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="center">Products</TableCell>
                    <TableCell align="center">Total Amount</TableCell>
                    <TableCell align="center">Sale Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredSales?.length > 0 ? (
                    filteredSales.map((sale, index) => (
                      <TableRow
                        key={sale._id}
                        hover
                        sx={{
                          "&:nth-of-type(odd)": {
                            backgroundColor: "action.hover",
                          },
                          "&:hover": {
                            backgroundColor: "primary.light",
                            opacity: 0.1,
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            #{sale._id.slice(-6).toUpperCase()}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Person sx={{ color: "primary.main" }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {sale?.customerId?.name || sale.name || "N/A"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {sale?.customerId?.phone ||
                                  sale.phone ||
                                  "No phone"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={`${sale.products.length} items`}
                            color="info"
                            size="small"
                            icon={<ShoppingCart />}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={formatMoney(sale.totalAmount)}
                            color="success"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            spacing={1}
                          >
                            <CalendarToday
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            <Typography variant="body2">
                              {formatDate(sale.saleDate)}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="center">
                          <Tooltip title="View Invoice Details" arrow>
                            <IconButton
                              onClick={() => handleOpenDialog(sale)}
                              color="primary"
                              sx={{
                                "&:hover": {
                                  backgroundColor: "primary.light",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease-in-out",
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Stack alignItems="center" spacing={2}>
                          <ShoppingCart
                            sx={{ fontSize: 60, color: "text.disabled" }}
                          />
                          <Typography variant="h6" color="text.secondary">
                            No sales found
                          </Typography>
                          <Typography variant="body2" color="text.disabled">
                            Try adjusting your filters or create a new sale
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Create Sale Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={handleCloseCreateDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              minHeight: "70vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              textAlign: "center",
              py: 3,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}
            >
              <Add />
              <Typography variant="h5" fontWeight={700}>
                Create New Sale
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 4 }}>
            {/* Customer Selection */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Customer Information
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Customer (Optional)</InputLabel>
                  <Select
                    value={newSale.customerId}
                    label="Select Customer (Optional)"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        setNewSale((prev) => ({
                          ...prev,
                          customerId: value,
                          customerName: "",
                          customerPhone: "",
                        }));
                      } else {
                        setNewSale((prev) => ({
                          ...prev,
                          customerId: "",
                        }));
                      }
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">
                      <em>Walk-in Customer</em>
                    </MenuItem>
                    {customers?.data?.map((customer) => (
                      <MenuItem key={customer._id} value={customer._id}>
                        <Stack>
                          <Typography>{customer.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.phone}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {!newSale.customerId && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Customer Name"
                      fullWidth
                      value={newSale.customerName}
                      onChange={(e) =>
                        setNewSale({ ...newSale, customerName: e.target.value })
                      }
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Customer Phone"
                      fullWidth
                      value={newSale.customerPhone}
                      onChange={(e) =>
                        setNewSale({
                          ...newSale,
                          customerPhone: e.target.value,
                        })
                      }
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Sale Date"
                    value={newSale.saleDate}
                    onChange={(date) =>
                      setNewSale({ ...newSale, saleDate: date })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Product Selection */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Add Products
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedProduct("");
                    }}
                    label="Category"
                    sx={{ borderRadius: 2 }}
                  >
                    {categories?.data?.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth disabled={!selectedCategory}>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    label="Product"
                    sx={{ borderRadius: 2 }}
                  >
                    {products?.data
                      ?.filter((p) => p.categoryId?._id === selectedCategory)
                      .map((product) => (
                        <MenuItem key={product._id} value={product._id}>
                          <Stack>
                            <Typography>{product.name}</Typography>
                            <Typography variant="caption" color="success.main">
                              {formatMoney(product.price)}
                            </Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Quantity"
                  type="number"
                  fullWidth
                  value={productQuantity}
                  onChange={(e) =>
                    setProductQuantity(
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  inputProps={{ min: 1 }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              onClick={handleAddProduct}
              disabled={!selectedProduct || productQuantity <= 0}
              fullWidth
              size="large"
              sx={{
                borderRadius: 2,
                py: 1.5,
                mb: 3,
                fontWeight: 600,
              }}
            >
              Add Product to Cart
            </Button>

            {/* Products Cart */}
            {newSale.products.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Products in Cart ({newSale.products.length} items)
                </Typography>

                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 2, mb: 2 }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "grey.100" }}>
                        <TableCell>
                          <strong>Product</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Category</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Unit Price</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Quantity</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Subtotal</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Action</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {newSale.products.map((item) => {
                        const product = getProductDetails(item.productId);
                        const subtotal = (product?.price || 0) * item.quantity;

                        return (
                          <TableRow key={item.productId} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {product?.name || "Unknown"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={product?.categoryId?.name || "N/A"}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              {formatMoney(product?.price || 0)}
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={item.quantity}
                                size="small"
                                color="info"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight={600} color="success.main">
                                {formatMoney(subtotal)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                onClick={() =>
                                  handleRemoveProduct(item.productId)
                                }
                                color="error"
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {/* Total Row */}
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="right"
                          sx={{ fontWeight: 700, fontSize: "1.1rem" }}
                        >
                          Total Amount:
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.2rem",
                            color: "success.main",
                          }}
                        >
                          {formatMoney(calculateTotalAmount())}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseCreateDialog}
              variant="outlined"
              size="large"
              sx={{ borderRadius: 2, px: 4 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateSale}
              disabled={dialogLoading || newSale.products.length === 0}
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                fontWeight: 600,
                minWidth: 140,
              }}
            >
              {dialogLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Sale"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sale Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              minHeight: "70vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              color: "white",
              textAlign: "center",
              py: 3,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}
            >
              <Receipt />
              <Typography variant="h5" fontWeight={700}>
                Invoice Details
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ p: 4 }}>
            {currentSale && (
              <>
                {/* Invoice Header */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Invoice #{currentSale._id.slice(-6).toUpperCase()}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={4}
                    sx={{ mt: 2 }}
                  >
                    <Stack alignItems="center">
                      <CalendarToday sx={{ color: "primary.main", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Date
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatDate(currentSale.saleDate)}
                      </Typography>
                    </Stack>
                    <Stack alignItems="center">
                      <AttachMoney sx={{ color: "success.main", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="success.main"
                      >
                        {formatMoney(currentSale.totalAmount)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Customer & Seller Info */}
                <Grid container spacing={4} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <Card
                      variant="outlined"
                      sx={{ p: 3, borderRadius: 2, height: "100%" }}
                    >
                      <Typography
                        variant="subtitle1"
                        color="primary.main"
                        fontWeight={700}
                        sx={{ mb: 2 }}
                      >
                        Sold By
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="h6" fontWeight={600}>
                          {currentSale?.userId?.name || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentSale?.userId?.email || "N/A"}
                        </Typography>
                      </Stack>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card
                      variant="outlined"
                      sx={{ p: 3, borderRadius: 2, height: "100%" }}
                    >
                      <Typography
                        variant="subtitle1"
                        color="success.main"
                        fontWeight={700}
                        sx={{ mb: 2 }}
                      >
                        Customer
                      </Typography>
                      {currentSale?.customerId ? (
                        <Stack spacing={1}>
                          <Typography variant="h6" fontWeight={600}>
                            {currentSale.customerId.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentSale.customerId.phone}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentSale.customerId.email}
                          </Typography>
                          {currentSale.customerId.address && (
                            <Typography variant="body2" color="text.secondary">
                              {currentSale.customerId.address}
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        <Stack spacing={1}>
                          <Typography variant="h6" fontWeight={600}>
                            {currentSale?.name || "Walk-in Customer"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentSale?.phone || "No phone provided"}
                          </Typography>
                        </Stack>
                      )}
                    </Card>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Products Table */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Items Purchased
                </Typography>

                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "primary.main" }}>
                        <TableCell sx={{ color: "white", fontWeight: 700 }}>
                          Product
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: "white", fontWeight: 700 }}
                        >
                          Unit Price
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: "white", fontWeight: 700 }}
                        >
                          Quantity
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: "white", fontWeight: 700 }}
                        >
                          Subtotal
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {currentSale?.products?.map((item, index) => (
                        <TableRow
                          key={item._id || index}
                          hover
                          sx={{
                            "&:nth-of-type(odd)": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body1" fontWeight={600}>
                              {item?.productId?.name || "Unknown Product"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatMoney(item?.unitPrice || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={item.quantity}
                              size="small"
                              color="info"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              color="success.main"
                            >
                              {formatMoney(item.total || 0)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Total Row */}
                      <TableRow
                        sx={{
                          backgroundColor: "success.light",
                          "& td": { borderBottom: "none" },
                        }}
                      >
                        <TableCell
                          colSpan={3}
                          align="right"
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.2rem",
                            color: "success.dark",
                          }}
                        >
                          Grand Total:
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.3rem",
                            color: "success.dark",
                          }}
                        >
                          {formatMoney(currentSale.totalAmount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Summary Stats */}
                <Grid container spacing={3} sx={{ mt: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: "center",
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                      }}
                    >
                      <ShoppingCart sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h6" fontWeight={700}>
                        {currentSale?.products?.length || 0}
                      </Typography>
                      <Typography variant="body2">Items Sold</Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: "center",
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                        color: "white",
                      }}
                    >
                      <AttachMoney sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h6" fontWeight={700}>
                        {formatMoney(currentSale?.totalAmount || 0)}
                      </Typography>
                      <Typography variant="body2">Total Revenue</Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: "center",
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)",
                        color: "white",
                      }}
                    >
                      <Person sx={{ fontSize: 32, mb: 1 }} />
                      <Typography variant="h6" fontWeight={700}>
                        {currentSale?.customerId ? "Registered" : "Walk-in"}
                      </Typography>
                      <Typography variant="body2">Customer Type</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                fontWeight: 600,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              Close
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
            variant="filled"
            sx={{
              width: "100%",
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </MainLayout>
  );
};

export default SalesManagement;
