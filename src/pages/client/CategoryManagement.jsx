import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
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
  Tooltip,
  TablePagination,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Card,
  CardHeader,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import api from "../../api/axiosConfig";
import MainLayout from "../../layouts/MainLayout";

const ConfirmDialog = ({ open, onClose, onConfirm, message }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle sx={{ bgcolor: "error.light", color: "common.white" }}>
      Confirm Deletion
    </DialogTitle>
    <DialogContent sx={{ pt: 3 }}>
      <Typography variant="body1">{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onClose} variant="outlined">
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        startIcon={<DeleteIcon />}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

const CategoryModal = ({
  open,
  onClose,
  onSave,
  category,
  businesses,
  isEdit,
  isLoading,
}) => {
  const theme = useTheme();
  const [form, setForm] = useState({
    name: category?.name || "",
    businessId: category?.businessId?._id || "",
    description: category?.description || "",
    status: category?.status || "active",
  });

  useEffect(() => {
    if (isEdit && category) {
      setForm({
        name: category.name || "",
        businessId: category.businessId?._id || "",
        description: category.description || "",
        status: category.status || "active",
      });
    } else {
      setForm({
        name: "",
        businessId: "",
        description: "",
        status: "active",
      });
    }
  }, [category, isEdit]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    const payload = {
      name: form.name.trim(),
      businessId: form.businessId,
      status: form.status,
    };

    if (form.description.trim()) {
      payload.description = form.description.trim();
    }

    onSave(isEdit ? { ...category, ...payload } : payload);
  };

  const requiredFieldsValid = form.name.trim() && form.businessId;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          bgcolor: isEdit ? theme.palette.info.light : theme.palette.primary.light,
          color: theme.palette.common.white,
        }}
      >
        {isEdit ? "Edit Category" : "Create New Category"}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Business</InputLabel>
          <Select
            label="Business *"
            name="businessId"
            value={form.businessId}
            onChange={handleChange}
            error={!form.businessId}
            startAdornment={
              <BusinessIcon
                color={form.businessId ? "primary" : "disabled"}
                sx={{ mr: 1 }}
              />
            }
          >
            <MenuItem value="">
              <em>Select Business</em>
            </MenuItem>
            {businesses.map((b) => (
              <MenuItem key={b._id} value={b._id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessIcon fontSize="small" />
                  {b.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          required
          label="Category Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          margin="normal"
          error={!form.name.trim()}
          helperText={!form.name.trim() && "Required"}
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "4px",
                  bgcolor: theme.palette.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                }}
              >
                <Typography variant="caption" color="white">
                  {form.name.trim() ? form.name.trim()[0].toUpperCase() : "C"}
                </Typography>
              </Box>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={3}
          placeholder="Optional description about this category..."
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            startAdornment={
              form.status === "active" ? (
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              ) : (
                <CancelIcon color="error" sx={{ mr: 1 }} />
              )
            }
          >
            {["active", "inactive"].map((opt) => (
              <MenuItem key={opt} value={opt}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {opt === "active" ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <CancelIcon color="error" fontSize="small" />
                  )}
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!requiredFieldsValid || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? "Processing..." : isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CategoryManagement = () => {
  const theme = useTheme();
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.user;
  const token = currentUser?.token;
  const [isLoading, setIsLoading] = useState(false);

  const [state, setState] = useState({
    categories: [],
    businesses: [],
    loading: false,
    error: null,
    page: 0,
    pageSize: 10,
    total: 0,
    businessFilter: "",
  });

  const [modals, setModals] = useState({
    add: false,
    edit: false,
    confirm: false,
    snackbar: { open: false, message: "", severity: "success" },
  });

  const [selected, setSelected] = useState({ category: null, deleteId: null });

  const fetchData = useCallback(
    async (type) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (type === "businesses") {
          const res = await api.get("/api/v1/businesses?limit=1000", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setState((prev) => ({
            ...prev,
            businesses: res.data.data?.data || [],
          }));
        } else {
          const res = await api.get(
            `/api/v1/categories?userId=${user._id}&page=${state.page + 1}&limit=${state.pageSize}`
          );
          const data = res.data.data;
          setState((prev) => ({
            ...prev,
            categories: data?.data || [],
            total: data?.total || 0,
            loading: false,
          }));
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error fetching data";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        setModals((prev) => ({
          ...prev,
          snackbar: { open: true, message: errorMessage, severity: "error" },
        }));
      }
    },
    [token, state.page, state.pageSize, state.businessFilter]
  );

  useEffect(() => {
    fetchData("businesses");
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!selected.deleteId) return;
    setIsLoading(true);
    try {
      await api.delete(`/api/v1/categories/${selected.deleteId}`);
      setModals((prev) => ({
        ...prev,
        confirm: false,
        snackbar: {
          open: true,
          message: "Category deleted successfully",
          severity: "success",
        },
      }));
      fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Delete failed";
      setModals((prev) => ({
        ...prev,
        snackbar: { open: true, message: errorMessage, severity: "error" },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data) => {
    setIsLoading(true);
    try {
      const method = selected.category ? "patch" : "post";
      const url = selected.category
        ? `/api/v1/categories/${selected.category._id}`
        : "/api/v1/categories";
      await api[method](url, data);

      setModals((prev) => ({
        ...prev,
        [selected.category ? "edit" : "add"]: false,
        snackbar: {
          open: true,
          message: `Category ${selected.category ? "updated" : "created"} successfully`,
          severity: "success",
        },
      }));
      fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Operation failed";
      setModals((prev) => ({
        ...prev,
        snackbar: { open: true, message: errorMessage, severity: "error" },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setState((prev) => ({ ...prev, businessFilter: e.target.value, page: 0 }));
  };

  const filteredCategory = state.categories.filter((category) => {
    const selectedBusinessId = state.businessFilter;
    if (!selectedBusinessId) return true;

    return category.businessId?._id === selectedBusinessId;
  });

  const handlePageChange = (_, newPage) => {
    setState((prev) => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (e) => {
    setState((prev) => ({
      ...prev,
      pageSize: +e.target.value,
      page: 0,
    }));
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Category Management</title>
      </Helmet>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardHeader
            title="Category Management"
            titleTypographyProps={{ variant: "h4", fontWeight: "bold" }}
            subheader="Manage your business categories"
            action={
              <Button
                variant="contained"
                onClick={() => {
                  setSelected({ category: null });
                  setModals((prev) => ({ ...prev, add: true }));
                }}
                disabled={!token}
                startIcon={<AddIcon />}
                sx={{ height: "fit-content" }}
              >
                New Category
              </Button>
            }
          />
          <Divider />

          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <FormControl sx={{ minWidth: 250 }} size="small">
                <InputLabel>Filter by Business</InputLabel>
                <Select
                  value={state.businessFilter}
                  onChange={handleFilterChange}
                  label="Filter by Business"
                  renderValue={(val) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BusinessIcon
                        fontSize="small"
                        color={val ? "primary" : "disabled"}
                      />
                      {val
                        ? state.businesses.find((b) => b._id === val)?.name ||
                          "Unknown"
                        : "All Businesses"}
                    </Box>
                  )}
                >
                  <MenuItem value="">
                    <em>All Businesses</em>
                  </MenuItem>
                  {state.businesses.map((b) => (
                    <MenuItem key={b._id} value={b._id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: theme.palette.primary.main,
                          }}
                        >
                          {b.name[0].toUpperCase()}
                        </Avatar>
                        {b.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {state.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {state.error}
              </Alert>
            )}

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Business</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Loading categories...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredCategory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <BusinessIcon
                            color="disabled"
                            sx={{ fontSize: 40, mb: 1 }}
                          />
                          <Typography variant="body1">
                            {state.businessFilter
                              ? "This business doesn't have any categories yet."
                              : "No categories found."}
                          </Typography>
                          <Button
                            variant="text"
                            onClick={() => {
                              setSelected({ category: null });
                              setModals((prev) => ({ ...prev, add: true }));
                            }}
                            sx={{ mt: 1 }}
                          >
                            Create your first category
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategory.map((cat, i) => (
                      <TableRow
                        key={cat._id}
                        hover
                        sx={{
                          "&:last-child td": { borderBottom: 0 },
                          "&:hover": { bgcolor: theme.palette.action.hover },
                        }}
                      >
                        <TableCell>{state.page * state.pageSize + i + 1}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: theme.palette.primary.main,
                              }}
                            >
                              {cat.businessId?.name?.[0]?.toUpperCase() || "B"}
                            </Avatar>
                            {cat.businessId?.name || "N/A"}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "4px",
                                bgcolor: theme.palette.primary.main,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography variant="caption" color="white">
                                {cat.name[0].toUpperCase()}
                              </Typography>
                            </Box>
                            {cat.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={cat.description || ""}>
                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "200px",
                                color: cat.description
                                  ? "text.primary"
                                  : "text.disabled",
                              }}
                            >
                              {cat.description || "No description"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cat.status.charAt(0).toUpperCase() + cat.status.slice(1)}
                            color={cat.status === "active" ? "success" : "error"}
                            size="small"
                            icon={
                              cat.status === "active" ? (
                                <CheckCircleIcon fontSize="small" />
                              ) : (
                                <CancelIcon fontSize="small" />
                              )
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => {
                                setSelected({ category: cat });
                                setModals((prev) => ({ ...prev, edit: true }));
                              }}
                              size="small"
                              color="primary"
                              sx={{
                                "&:hover": {
                                  bgcolor: theme.palette.primary.light,
                                  color: "white",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => {
                                setSelected({ deleteId: cat._id });
                                setModals((prev) => ({ ...prev, confirm: true }));
                              }}
                              color="error"
                              size="small"
                              sx={{
                                "&:hover": {
                                  bgcolor: theme.palette.error.light,
                                  color: "white",
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {state.total > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 50]}
                component="div"
                count={state.total}
                rowsPerPage={state.pageSize}
                page={state.page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                sx={{
                  borderTop: `1px solid ${theme.palette.divider}`,
                  pt: 2,
                }}
              />
            )}
          </Box>
        </Card>

        <CategoryModal
          open={modals.add}
          onClose={() => setModals((prev) => ({ ...prev, add: false }))}
          onSave={handleSave}
          category={null}
          businesses={state.businesses}
          isEdit={false}
          isLoading={isLoading}
        />

        <CategoryModal
          open={modals.edit}
          onClose={() => setModals((prev) => ({ ...prev, edit: false }))}
          onSave={handleSave}
          category={selected.category}
          businesses={state.businesses}
          isEdit={true}
          isLoading={isLoading}
        />

        <ConfirmDialog
          open={modals.confirm}
          onClose={() => setModals((prev) => ({ ...prev, confirm: false }))}
          onConfirm={handleDelete}
          message="Are you sure you want to delete this category? This action cannot be undone."
        />

        <Snackbar
          open={modals.snackbar.open}
          autoHideDuration={6000}
          onClose={() =>
            setModals((prev) => ({
              ...prev,
              snackbar: { ...prev.snackbar, open: false },
            }))
          }
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={modals.snackbar.severity}
            onClose={() =>
              setModals((prev) => ({
                ...prev,
                snackbar: { ...prev.snackbar, open: false },
              }))
            }
            sx={{ width: "100%" }}
            elevation={6}
          >
            {modals.snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default CategoryManagement;