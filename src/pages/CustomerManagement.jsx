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
  MenuItem,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  Person,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axiosConfig";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [filter, setFilter] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers?.data?.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(filter.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(filter.toLowerCase()) ||
      customer.email?.toLowerCase().includes(filter.toLowerCase()) ||
      customer.address?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleOpenDialog = (customer) => {
    setCurrentCustomer(
      customer
        ? { ...customer }
        : { name: "", phone: "", email: "", address: "", note: "" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCustomer(null);
    setDialogLoading(false);
  };

  const handleDialogInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value,
    }));
  };

  const handleSaveCustomer = async () => {
    setDialogLoading(true);
    const isEditing = currentCustomer && currentCustomer._id;

    try {
      if (isEditing) {
        await api.put(
          `api/v1/customers/${currentCustomer._id}`,
          currentCustomer
        );
      } else {
        const { _id, ...newCustomer } = currentCustomer;
        await api.post("api/v1/customers", newCustomer);
      }

      setNotification({
        open: true,
        message: isEditing
          ? "Customer updated successfully!"
          : "New customer added successfully!",
        severity: "success",
      });
      handleCloseDialog();
      await fetchCustomers();
    } catch (error) {
      console.error("Failed to save customer:", error);
      setNotification({
        open: true,
        message: `Failed to save customer: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`,
        severity: "error",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      await api.delete(`api/v1/customers/${id}`);
      setNotification({
        open: true,
        message: "Customer deleted successfully!",
        severity: "success",
      });
      await fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      setNotification({
        open: true,
        message: `Failed to delete customer: ${
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
            Customer Management
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
            Add Customer
          </Button>
        </Box>

        <Card sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <TextField
            variant="outlined"
            label="Search customers..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
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
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Note</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers?.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <TableRow
                        key={customer._id}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                              <Person />
                            </Avatar>
                            <Typography>{customer.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>
                          <Typography color="text.secondary">
                            {customer.address}
                          </Typography>
                        </TableCell>
                        <TableCell>{customer.note}</TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleOpenDialog(customer)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDeleteCustomer(customer._id)}
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
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No customers found
                        </Typography>
                        <Button
                          onClick={() => handleOpenDialog(null)}
                          startIcon={<Add />}
                          sx={{ mt: 1 }}
                        >
                          Add New Customer
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
            {currentCustomer?._id ? "Edit Customer" : "Add New Customer"}
            <Person sx={{ ml: 1, verticalAlign: "middle" }} />
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              margin="normal"
              label="Full Name"
              fullWidth
              name="name"
              value={currentCustomer?.name || ""}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              label="Phone Number"
              fullWidth
              name="phone"
              value={currentCustomer?.phone || ""}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              label="Email"
              fullWidth
              name="email"
              value={currentCustomer?.email || ""}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              label="Address"
              fullWidth
              name="address"
              value={currentCustomer?.address || ""}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              label="Notes"
              fullWidth
              name="note"
              value={currentCustomer?.note || ""}
              onChange={handleDialogInputChange}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
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
              onClick={handleSaveCustomer}
              color="primary"
              variant="contained"
              disabled={dialogLoading}
              startIcon={
                dialogLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {currentCustomer?._id ? "Update" : "Create"}
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

export default CustomerManagement;
