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
  Autocomplete,
  Divider,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Search,
  Add,
  Receipt,
  Visibility,
  Delete,
  AttachMoney,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axiosConfig";
import { formatDate, formatMoney } from "../components/Format";

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [filter, setFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);
  const [productFilter, setProductFilter] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSale, setNewSale] = useState({
    customerId: "",
    customerName: "",
    customerPhone: "",
    saleDate: new Date(),
    products: [],
  });

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
    setLoading(true);
    try {
      const response = await api.get("api/v1/customers");
      setCustomers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setNotification({
        open: true,
        message: `Failed to fetch customers: ${error.message || "Unknown error"}`,
        severity: "error",
      });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchSales();
    fetchProducts();
    fetchCustomers();
    fetchCategories();
  }, [fetchSales, fetchProducts, fetchCustomers, fetchCategories]);

  const filteredSales = sales?.data?.filter((sale) => {
    const matchesDate = dateFilter
      ? new Date(sale.saleDate).toDateString() ===
        new Date(dateFilter).toDateString()
      : true;

    const matchesProduct = productFilter
      ? sale.products.some((item) => item.productId === productFilter)
      : true;

    return matchesDate && matchesProduct;
  });

  const handleOpenDialog = (sale) => {
    setCurrentSale(sale);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSale(null);
  };

  // Create Sale Dialog
  const handleOpenCreateDialog = () => {
    setNewSale({ userId: "", saleDate: new Date(), products: [] });
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleAddProduct = () => {
    if (!selectedProduct || productQuantity <= 0) return;
    const product = products.data.find((p) => p._id === selectedProduct);
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

  const getProductDetails = (id) => products.data.find((p) => p._id === id);

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
            Sales Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
            onClick={handleOpenCreateDialog}
          >
            New Sale
          </Button>
        </Box>

        <Card sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              variant="outlined"
              label="Search by customer..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
            />

            <TextField
              select
              label="Filter by product"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              fullWidth
            >
              <MenuItem value="">All Products</MenuItem>
              {products?.data?.map((product) => (
                <MenuItem key={product._id} value={product._id}>
                  {product.name}
                </MenuItem>
              ))}
            </TextField>
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
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Customer Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Total Products
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Sale Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSales?.length > 0 ? (
                    filteredSales.map((sale) => {
                      return (
                        <TableRow
                          key={sale._id}
                          hover
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell>{sale._id}</TableCell>
                          <TableCell>
                            <Typography>
                              {sale?.customerId?.name || sale.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {sale.products.length}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={formatMoney(sale.totalAmount)}
                              color="success"
                              // icon={<AttachMoney />}
                            />
                          </TableCell>
                          <TableCell>{formatDate(sale.saleDate)}</TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                onClick={() => handleOpenDialog(sale)}
                                color="primary"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            {/* <Tooltip title="Delete">
                              <IconButton
                                onClick={() => handleDeleteSale(sale._id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip> */}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No sales found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Create Sale Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={handleCloseCreateDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Create New Sale</DialogTitle>
          <DialogContent dividers>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Customer (optional)</InputLabel>
              <Select
                value={newSale.customerId}
                label="Select Customer (optional)"
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
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {customers?.data?.map((customer) => (
                  <MenuItem key={customer._id} value={customer._id}>
                    {customer.name} ({customer.phone})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {!newSale.customerId && (
              <>
                <TextField
                  label="Customer Name"
                  fullWidth
                  value={newSale.customerName}
                  onChange={(e) =>
                    setNewSale({ ...newSale, customerName: e.target.value })
                  }
                  margin="normal"
                />
                <TextField
                  label="Customer Phone"
                  fullWidth
                  value={newSale.customerPhone}
                  onChange={(e) =>
                    setNewSale({ ...newSale, customerPhone: e.target.value })
                  }
                  margin="normal"
                />
              </>
            )}

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Sale Date"
                value={newSale.saleDate}
                onChange={(date) => setNewSale({ ...newSale, saleDate: date })}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" />
                )}
              />
            </LocalizationProvider>

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Add Products
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Select Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Select Category"
              >
                {categories?.data?.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" disabled={!selectedCategory}>
              <InputLabel>Select Product</InputLabel>
              <Select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                label="Select Product"
              >
                {products?.data
                  ?.filter((p) => p.categoryId?._id === selectedCategory)
                  .map((product) => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.name} - ${product.price}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              label="Quantity"
              type="number"
              margin="normal"
              fullWidth
              value={productQuantity}
              onChange={(e) =>
                setProductQuantity(parseInt(e.target.value) || 1)
              }
            />

            <Button
              variant="outlined"
              onClick={handleAddProduct}
              fullWidth
              sx={{ mt: 1 }}
            >
              Add Product
            </Button>

            {newSale.products.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {newSale.products.map((p) => {
                      const product = getProductDetails(p.productId);
                      return (
                        <TableRow key={p.productId}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.categoryId.name}</TableCell>
                          <TableCell align="right">${product.price}</TableCell>
                          <TableCell align="right">{p.quantity}</TableCell>
                          <TableCell align="right">
                            ${(product.price * p.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseCreateDialog}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
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
                    message: `Failed to create sale: ${error.response?.data?.message || error.message}`,
                    severity: "error",
                  });
                } finally {
                  setDialogLoading(false);
                }
              }}
            >
              {dialogLoading ? <CircularProgress size={24} /> : "Create Sale"}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Sale Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: "bold",
              fontSize: 20,
              textAlign: "center",
              pb: 2,
            }}
          >
            Invoice Details
            <Receipt sx={{ ml: 1, verticalAlign: "middle" }} />
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            {currentSale && (
              <>
                {/* Centered Invoice info at top */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Invoice #{currentSale._id.slice(-6).toUpperCase()}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Date: {formatDate(currentSale.saleDate)}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Total Amount: {formatMoney(currentSale.totalAmount)}
                  </Typography>
                </Box>

                {/* Seller & Customer Info */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 4,
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  {/* Seller info on left */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Seller
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {currentSale?.userId?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {currentSale?.userId?.email}
                    </Typography>
                  </Box>

                  {/* Customer info on right */}
                  <Box sx={{ flex: 1, minWidth: 200, textAlign: "right" }}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Customer
                    </Typography>
                    {currentSale?.customerId ? (
                      <>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {currentSale?.customerId?.name || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {currentSale?.customerId?.phone || ""}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {currentSale?.customerId?.email || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {currentSale?.customerId?.address || ""}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {currentSale?.customerId?.note || "N/A"}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {currentSale?.name || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {currentSale?.phone || ""}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>

                {/* Products Table */}
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "grey.100" }}>
                        <TableCell>
                          <b>Product</b>
                        </TableCell>
                        <TableCell align="right">
                          <b>Unit Price</b>
                        </TableCell>
                        <TableCell align="right">
                          <b>Quantity</b>
                        </TableCell>
                        <TableCell align="right">
                          <b>Subtotal</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {currentSale?.products?.map((item) => {
                        return (
                          <TableRow key={item._id}>
                            <TableCell>
                              {item?.productId?.name || "Unknown Product"}
                            </TableCell>
                            <TableCell align="right">
                              {formatMoney(item?.unitPrice)}
                            </TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              {formatMoney(item.total)}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {/* Total Row */}
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          align="right"
                          sx={{ fontWeight: "bold" }}
                        >
                          Total
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", fontSize: 16 }}
                        >
                          {formatMoney(currentSale.totalAmount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseDialog}
              color="primary"
              variant="contained"
            >
              Close
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

export default SalesManagement;
