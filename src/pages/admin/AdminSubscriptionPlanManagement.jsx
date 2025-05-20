import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  MenuItem,
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Loading from "../../components/Loading";
import api from "../../api/axiosConfig";

const SubscriptionFormDialog = ({
  open,
  onClose,
  onSubmit,
  subscription,
  loading,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState(0);
  const [features, setFeatures] = useState([]);
  const [maxBusiness, setMaxBusiness] = useState(0);
  const [maxCategory, setMaxCategory] = useState(0);
  const [maxItem, setMaxItem] = useState(0);
  const [analysisType, setAnalysisType] = useState("basic");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (subscription && open) {
      setName(subscription.name || "");
      setPrice(subscription.price || 0);
      setDuration(subscription.duration || 0);
      setFeatures(subscription.features || []);
      setMaxBusiness(subscription.maxBusiness || 0);
      setMaxCategory(subscription.maxCategory || 0);
      setMaxItem(subscription.maxItem || 0);
      setAnalysisType(subscription.analysisType || "basic");
      setStatus(subscription.status || "active");
    }
  }, [subscription, open]);

  useEffect(() => {
    if (!open) {
      setName("");
      setPrice(0);
      setDuration(0);
      setFeatures([]);
      setMaxBusiness(0);
      setMaxCategory(0);
      setMaxItem(0);
      setAnalysisType("basic");
      setStatus("active");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim() || price <= 0 || duration <= 0) {
      toast.error("Please fill in all the required fields");
      return;
    }

    const formData = {
      ...subscription,
      name,
      price,
      duration,
      features,
      maxBusiness,
      maxCategory,
      maxItem,
      analysisType,
      status,
    };

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {subscription ? "Edit Subscription" : "Add Subscription"}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Subscription Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Duration (days)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Max Business"
          type="number"
          value={maxBusiness}
          onChange={(e) => setMaxBusiness(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Max Category"
          type="number"
          value={maxCategory}
          onChange={(e) => setMaxCategory(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Max Item"
          type="number"
          value={maxItem}
          onChange={(e) => setMaxItem(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          select
          label="Analysis Type"
          value={analysisType}
          onChange={(e) => setAnalysisType(e.target.value)}
          margin="normal"
        >
          <MenuItem value="basic">Basic</MenuItem>
          <MenuItem value="advanced">Advanced</MenuItem>
        </TextField>
        <TextField
          fullWidth
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          margin="normal"
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ConfirmDialog = ({ message, onConfirm, onClose, open, loading }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirmation</DialogTitle>
    <DialogContent>{message}</DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        variant="contained"
        color="error"
        onClick={onConfirm}
        disabled={loading}
      >
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

const SubscriptionDetailDialog = ({ open, onClose, subscription, loading }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Subscription Plan Details</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Name: {subscription?.name}</Typography>
        <Typography variant="body1">Price: ${subscription?.price}</Typography>
        <Typography variant="body1">
          Duration: {subscription?.duration} days
        </Typography>
        <Typography variant="body1">
          Max Business: {subscription?.maxBusiness}
        </Typography>
        <Typography variant="body1">
          Max Category: {subscription?.maxCategory}
        </Typography>
        <Typography variant="body1">
          Max Item: {subscription?.maxItem}
        </Typography>
        <Typography variant="body1">
          Analysis Type: {subscription?.analysisType}
        </Typography>
        <Typography variant="body1">Status: {subscription?.status}</Typography>
        <Typography variant="body1">
          Features: {subscription?.features?.join(", ") || "None"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminSubscriptionPlanManagement = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.token;

  const title = "Subscription Management";

  const [subscriptions, setSubscriptions] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [error, setError] = useState();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/subscription-plans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubscriptions(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch subscriptions");
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (subscriptionData) => {
    setLoading(true);
    try {
      if (subscriptionData._id) {
        const res = await api.patch(
          `/api/v1/subscription-plans/${subscriptionData._id}`,
          subscriptionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(res.data.message);
      } else {
        const res = await api.post(
          "/api/v1/subscription-plans",
          subscriptionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(res.data.message);
      }
      fetchSubscriptions();
      setFormOpen(false);
      setSelectedSubscription(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/v1/subscription-plans/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(res.data.message);
      fetchSubscriptions();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error deleting subscription"
      );
    } finally {
      setLoading(false);
    }
    setConfirmOpen(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <MainLayout>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Button variant="contained" onClick={() => setFormOpen(true)}>
          Add Subscription
        </Button>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Loading />
                  </TableCell>
                </TableRow>
              ) : subscriptions.total > 0 ? (
                subscriptions?.data?.map((subscription) => (
                  <TableRow key={subscription._id}>
                    <TableCell>{subscription._id}</TableCell>
                    <TableCell>{subscription.name}</TableCell>
                    <TableCell>{subscription.price}</TableCell>
                    <TableCell>{subscription.duration} days</TableCell>
                    <TableCell>{subscription.status}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setViewOpen(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setFormOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setDeleteId(subscription._id);
                            setConfirmOpen(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : subscriptions.total < 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No subscriptions found.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    style={{ color: "red" }}
                  >
                    {error}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Dialogs */}
      <SubscriptionFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedSubscription(null);
        }}
        onSubmit={handleCreateOrUpdate}
        subscription={selectedSubscription}
        loading={loading}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this subscription?"
        loading={loading}
      />
      <SubscriptionDetailDialog
        open={viewOpen}
        onClose={() => setViewOpen(false)} // Close the detail view dialog
        subscription={selectedSubscription}
        loading={loading}
      />
    </MainLayout>
  );
};

export default AdminSubscriptionPlanManagement;
