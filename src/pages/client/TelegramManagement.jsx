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
  Chip,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  Telegram,
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

const TelegramManagement = () => {
  const [telegrams, setTelegrams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchTelegrams = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("api/v1/telegrams");
      setTelegrams(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch telegrams:", error);
      setNotification({
        open: true,
        message: `Failed to fetch telegrams: ${error.message || "Unknown error"}`,
        severity: "error",
      });
      setTelegrams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelegrams();
  }, [fetchTelegrams]);

  const filteredTelegrams = telegrams?.data?.filter(
    (user) =>
      user.name?.toLowerCase().includes(filter.toLowerCase()) ||
      user.username?.toLowerCase().includes(filter.toLowerCase()) ||
      user.status?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleOpenDialog = (user) => {
    setCurrentUser(
      user
        ? { ...user }
        : { name: "", username: "", phoneNumber: "", status: "active" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
    setDialogLoading(false);
  };

  const handleDialogInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSaveUser = async () => {
    setDialogLoading(true);
    const isEditing = currentUser && currentUser._id;

    try {
      if (isEditing) {
        await api.patch(`api/v1/telegrams/${currentUser._id}`, currentUser);
      } else {
        const { _id, ...newUser } = currentUser;
        await api.post("api/v1/telegrams", newUser);
      }

      setNotification({
        open: true,
        message: isEditing
          ? "Telegram account updated successfully!"
          : "New Telegram account added successfully!",
        severity: "success",
      });
      handleCloseDialog();
      await fetchTelegrams();
    } catch (error) {
      console.error("Failed to save Telegram account:", error);
      setNotification({
        open: true,
        message: `Failed to save Telegram account: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`,
        severity: "error",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Telegram account?")) {
      return;
    }

    try {
      await api.delete(`api/v1/telegrams/${id}`);
      setNotification({
        open: true,
        message: "Telegram account deleted successfully!",
        severity: "success",
      });
      await fetchTelegrams();
    } catch (error) {
      console.error("Failed to delete Telegram account:", error);
      setNotification({
        open: true,
        message: `Failed to delete Telegram account: ${
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
            Telegram Accounts
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
            Add Account
          </Button>
        </Box>

        <Card sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <TextField
            variant="outlined"
            label="Search accounts..."
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
                    <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTelegrams?.length > 0 ? (
                    filteredTelegrams.map((telegram) => (
                      <TableRow
                        key={telegram._id}
                        hover
                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                              <Telegram />
                            </Avatar>
                            <Typography>{telegram.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary">
                            @{telegram.username}
                          </Typography>
                        </TableCell>
                        <TableCell>{telegram.phoneNumber}</TableCell>
                        <TableCell>
                          <StatusChip status={telegram.status} />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleOpenDialog(telegram)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDeleteUser(telegram._id)}
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
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No Telegram accounts found
                        </Typography>
                        <Button
                          onClick={() => handleOpenDialog(null)}
                          startIcon={<Add />}
                          sx={{ mt: 1 }}
                        >
                          Add New Account
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
            {currentUser?._id ? "Edit Telegram Account" : "Add New Telegram Account"}
            <Telegram sx={{ ml: 1, verticalAlign: "middle" }} />
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              margin="normal"
              label="Name"
              fullWidth
              name="name"
              value={currentUser?.name || ""}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              label="Username (without @)"
              fullWidth
              name="username"
              value={currentUser?.username || ""}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1 }} color="text.secondary">
                    @
                  </Typography>
                ),
              }}
            />
            <TextField
              margin="normal"
              label="Phone Number"
              fullWidth
              name="phoneNumber"
              value={currentUser?.phoneNumber || ""}
              onChange={handleDialogInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Status"
              name="status"
              fullWidth
              value={currentUser?.status || "active"}
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
              onClick={handleSaveUser}
              color="primary"
              variant="contained"
              disabled={dialogLoading}
              startIcon={
                dialogLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {currentUser?._id ? "Update" : "Create"}
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

export default TelegramManagement;