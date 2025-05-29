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
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axiosConfig";

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
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

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [fetchSales, fetchProducts]);

  const filteredSales = sales?.data?.filter((sale) => {
    const matchesDate = dateFilter ? 
      new Date(sale.saleDate).toDateString() === new Date(dateFilter).toDateString() : 
      true;

    const matchesProduct = productFilter ? 
      sale.products.some(item => item.productId === productFilter) : 
      true;

    return matchesDate && matchesProduct;
  });

  const calculateTotal = (items) => {
    if (!items || !products.data) return 0;
    return items.reduce((total, item) => {
      const product = products.data.find(p => p._id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleOpenDialog = (sale) => {
    setCurrentSale(sale);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSale(null);
  };

  const handleDeleteSale = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) {
      return;
    }

    try {
      await api.delete(`api/v1/sales/${id}`);
      setNotification({
        open: true,
        message: "Sale deleted successfully!",
        severity: "success",
      });
      await fetchSales();
    } catch (error) {
      console.error("Failed to delete sale:", error);
      setNotification({
        open: true,
        message: `Failed to delete sale: ${
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
            Sales Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            New Sale
          </Button>
        </Box>
            
        <Card sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
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
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Filter by date"
                value={dateFilter}
                onChange={(newValue) => setDateFilter(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
            
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
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Products</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSales?.length > 0 ? (
                    filteredSales.map((sale) => {
                      const totalAmount = calculateTotal(sale.products);
                      return (
                        <TableRow
                          key={sale._id}
                          hover
                          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                          <TableCell>{sale._id.substring(0, 6)}...</TableCell>
                          <TableCell>
                            <Typography>{sale?.userId?.name || 'N/A'}</Typography>
                          </TableCell>
                          <TableCell>
                            {sale.products.length}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`$${totalAmount.toFixed(2)}`}
                              color="success"
                              icon={<AttachMoney />}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                onClick={() => handleOpenDialog(sale)}
                                color="primary"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                onClick={() => handleDeleteSale(sale._id)}
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

        {/* Sale Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
            Sale Details
            <Receipt sx={{ ml: 1, verticalAlign: "middle" }} />
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {currentSale && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Customer: {currentSale?.userId?.name || 'N/A'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Date: {new Date(currentSale.saleDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Total: ${calculateTotal(currentSale.products).toFixed(2)}
                  </Typography>
                </Box>

                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                  Products
                </Typography>
                
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentSale.products.map((item) => {
                        const product = products.data?.find(p => p._id === item.productId);
                        return (
                          <TableRow key={item.productId}>
                            <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                            <TableCell>${product?.price.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              ${(product?.price * item.quantity).toFixed(2) || '0.00'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
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