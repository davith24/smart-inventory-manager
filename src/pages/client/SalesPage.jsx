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
  TableFooter,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  Receipt,
  CheckCircle,
  Cancel,
  AttachMoney,
  Remove,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axiosConfig";

const STATUS_OPTIONS = ["completed", "pending", "cancelled"];

const StatusChip = ({ status }) => {
  const colorMap = {
    completed: "success",
    pending: "warning",
    cancelled: "error",
  };

  return (
    <Chip
      label={status}
      color={colorMap[status] || "default"}
      size="small"
      icon={status === "completed" ? <CheckCircle /> : <Cancel />}
    />
  );
};

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
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
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

  console.log(sales)

  const filteredSales = sales?.data?.filter((sale) => {
    // const matchesSearch = sale.products?.product.name?.toLowerCase().includes(filter.toLowerCase()) ||
    //                      sale.status?.toLowerCase().includes(filter.toLowerCase());

    const matchesDate = dateFilter ? 
      new Date(sale.saleDate).toDateString() === new Date(dateFilter).toDateString() : 
      true;

    const matchesProduct = productFilter ? 
      sale.products.some(item => item.productId === productFilter) : 
      true;

    // return matchesSearch && matchesDate && matchesProduct;
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
    setCurrentSale(
      sale
        ? { 
            ...sale,
            saleDate: new Date(sale.saleDate)
          }
        : { 
            customerName: "", 
            saleDate: new Date(), 
            status: "completed",
            products: [],
          }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSale(null);
    setDialogLoading(false);
    setSelectedProduct("");
    setQuantity(1);
  };

  const handleDialogInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentSale((prevSale) => ({
      ...prevSale,
      [name]: value,
    }));
  };

  const handleAddProduct = () => {
    if (!selectedProduct || quantity <= 0) return;

    const existingIndex = currentSale.products.findIndex(
      item => item.productId === selectedProduct
    );

    if (existingIndex >= 0) {
      // Update quantity if product already exists
      const updatedProducts = [...currentSale.products];
      updatedProducts[existingIndex].quantity += quantity;
      setCurrentSale(prev => ({
        ...prev,
        products: updatedProducts
      }));
    } else {
      // Add new product
      setCurrentSale(prev => ({
        ...prev,
        products: [
          ...prev.products,
          {
            productId: selectedProduct,
            quantity: quantity
          }
        ]
      }));
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveProduct = (productId) => {
    setCurrentSale(prev => ({
      ...prev,
      products: prev.products.filter(item => item.productId !== productId)
    }));
  };

  const handleSaveSale = async () => {
    setDialogLoading(true);
    const isEditing = currentSale && currentSale._id;

    try {
      const saleData = {
        customerName: currentSale.customerName,
        saleDate: currentSale.saleDate,
        status: currentSale.status,
        products: currentSale.products,
      };

      if (isEditing) {
        await api.patch(`api/v1/sales/${currentSale._id}`, saleData);
      } else {
        await api.post("api/v1/sales", saleData);
      }

      setNotification({
        open: true,
        message: isEditing
          ? "Sale updated successfully!"
          : "New sale added successfully!",
        severity: "success",
      });
      handleCloseDialog();
      await fetchSales();
    } catch (error) {
      console.error("Failed to save sale:", error);
      setNotification({
        open: true,
        message: `Failed to save sale: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`,
        severity: "error",
      });
    } finally {
      setDialogLoading(false);
    }
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
            Sales
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
            Add New Sale
          </Button>
        </Box>
            
        <Card sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              variant="outlined"
              label="Search sales..."
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
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Products</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
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
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                                <Receipt />
                              </Avatar>
                              <Typography>{sale?.userId?.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {sale.products.length} items
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`$${totalAmount.toFixed(2)}`}
                              color="success"
                              icon={<AttachMoney />}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusChip status={sale.status} />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton
                                onClick={() => handleOpenDialog(sale)}
                                color="primary"
                              >
                                <Edit />
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
                        <Button
                          onClick={() => handleOpenDialog(null)}
                          startIcon={<Add />}
                          sx={{ mt: 1 }}
                        >
                          Add New Sale
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
          maxWidth="md"
        >
          <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
            {currentSale?._id ? "Edit Sale" : "Add New Sale"}
            <Receipt sx={{ ml: 1, verticalAlign: "middle" }} />
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                margin="normal"
                label="Customer Name"
                fullWidth
                name="customerName"
                value={currentSale?.customerName || ""}
                onChange={handleDialogInputChange}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Sale Date"
                  value={currentSale?.saleDate || new Date()}
                  onChange={(newValue) => 
                    setCurrentSale(prev => ({ ...prev, saleDate: newValue }))
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Box>
            
            <TextField
              select
              label="Status"
              name="status"
              fullWidth
              value={currentSale?.status || "completed"}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            
            <Typography variant="h6" sx={{ mt: 2 }}>
              Products
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 2 }}>
              <TextField
                select
                label="Product"
                fullWidth
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <MenuItem value="">Select a product</MenuItem>
                {products?.data?.map((product) => (
                  <MenuItem key={product._id} value={product._id}>
                    {product.name} (${product.price.toFixed(2)})
                  </MenuItem>
                ))}
              </TextField>
              
               <TextField
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
                sx={{ width: '120px' }}
              />
              
              <Button 
                variant="contained" 
                onClick={handleAddProduct}
                disabled={!selectedProduct}
              >
                Add
              </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Subtotal</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentSale?.products?.map((item) => {
                    const product = products.data?.find(p => p._id === item.productId);
                    return (
                      <TableRow key={item.productId}>
                        <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                        <TableCell>${product?.price.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          ${(product?.price * item.quantity).toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveProduct(item.productId)}
                            color="error"
                          >
                            <Remove />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {currentSale?.products?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No products added
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {currentSale?.products?.length > 0 && (
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="subtitle1">Total:</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1">
                          ${calculateTotal(currentSale.products).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </TableContainer>
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
              onClick={handleSaveSale}
              color="primary"
              variant="contained"
              disabled={dialogLoading || currentSale?.products?.length === 0}
              startIcon={
                dialogLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {currentSale?._id ? "Update" : "Create"}
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