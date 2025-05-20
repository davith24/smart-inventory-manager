import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  TablePagination,
  CircularProgress,
  Alert,
  InputAdornment,
  LinearProgress,
  Avatar,
  Card,
  CardContent,
  Divider,
  Grid,
  useTheme
} from "@mui/material";
import { Edit, Add, Close, CloudUpload } from "@mui/icons-material";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import { Helmet } from "react-helmet";
import MainLayout from "../../layouts/MainLayout";
import { useSelector } from "react-redux";
import api from "../../api/axiosConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

// Constants
const INITIAL_FORM_STATE = {
  name: "",
  description: "",
  businessId: "",
  category: "",
  image: null,
  price: "",
  status: "active",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Sub-components
const ConfirmDialog = ({ message, onConfirm, onClose, open }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      Confirm Deletion
    </DialogTitle>
    <DialogContent sx={{ p: 3 }}>
      <Typography variant="body1">{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
      <Button onClick={onClose} variant="outlined" color="inherit">
        Cancel
      </Button>
      <Button variant="contained" color="error" onClick={onConfirm}>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

const ItemManagement = () => {
  const theme = useTheme();
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.user;

  // State management
  const [state, setState] = useState({
    items: [],
    businesses: [],
    categories: [],
    dialogCategories: [],
    totalItems: 0,
    pageNumber: 1,
    pageSize: 10,
    searchQuery: "",
    open: false,
    confirmOpen: false,
    deleteId: null,
    editingItem: null,
    form: INITIAL_FORM_STATE,
    formErrors: {},
    isSubmitting: false,
    isLoading: false,
    error: null,
    uploadProgress: 0,
    isUploading: false,
    filters: {
      status: "All",
      business: "",
      category: "",
    }
  });

  // Destructure state for easier access
  const {
    items, businesses, categories, dialogCategories, totalItems,
    pageNumber, pageSize, searchQuery, open, confirmOpen, deleteId,
    editingItem, form, formErrors, isSubmitting, isLoading, error,
    uploadProgress, isUploading, filters
  } = state;

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBusiness = !filters.business || item.businessId?._id === filters.business;
      const matchesCategory = !filters.category || item.categoryId?._id === filters.category;
      return matchesSearch && matchesBusiness && matchesCategory;
    });
  }, [items, searchQuery, filters.business, filters.category]);

  // API calls
  const fetchItems = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const params = {
      page: pageNumber,
      size: pageSize,
      userId: user?._id,
      search: searchQuery,
      businessId: filters.business || undefined,
      categoryId: filters.category || undefined,
    };

    try {
      const response = await api.get("/api/v1/items", { params });
      const data = response.data.data;
      setState(prev => ({
        ...prev,
        items: data.data || [],
        totalItems: data.total || 0,
        isLoading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Failed to fetch items: ${err.response?.data?.message || err.message}`,
        items: [],
        totalItems: 0,
        isLoading: false
      }));
    }
  }, [pageNumber, pageSize, searchQuery, filters.business, filters.category, user?._id]);

  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await api.get("/api/v1/businesses");
      setState(prev => ({
        ...prev,
        businesses: response.data.data.data || []
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Failed to fetch businesses: ${err.response?.data?.message || err.message}`,
        businesses: []
      }));
    }
  }, []);

  const fetchCategories = useCallback(async (businessId, isDialog = false) => {
    if (!businessId) {
      setState(prev => ({
        ...prev,
        [isDialog ? 'dialogCategories' : 'categories']: []
      }));
      return;
    }

    try {
      const response = await api.get(`/api/v1/categories?businessId=${businessId}`);
      setState(prev => ({
        ...prev,
        [isDialog ? 'dialogCategories' : 'categories']: response.data.data.data || [],
        formErrors: isDialog ? {
          ...prev.formErrors,
          category: response.data.data.data?.length ? null : "No categories available"
        } : prev.formErrors
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        [isDialog ? 'dialogCategories' : 'categories']: [],
        formErrors: isDialog ? {
          ...prev.formErrors,
          category: "Could not load categories"
        } : prev.formErrors
      }));
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (filters.business) {
      fetchCategories(filters.business);
      setState(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          category: ""
        }
      }));
    } else {
      setState(prev => ({
        ...prev,
        categories: []
      }));
    }
  }, [filters.business, fetchCategories]);

  useEffect(() => {
    if (form.businessId) {
      fetchCategories(form.businessId, true);
    } else {
      setState(prev => ({
        ...prev,
        dialogCategories: []
      }));
    }
  }, [form.businessId, fetchCategories]);

  // Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    setState(prev => {
      const newForm = { ...prev.form, [name]: value };
      if (name === "businessId") {
        newForm.category = "";
      }
      
      return {
        ...prev,
        form: newForm,
        formErrors: prev.formErrors[name] ? {
          ...prev.formErrors,
          [name]: null
        } : prev.formErrors
      };
    });
  };

  const uploadImage = async (file) => {
    if (!file) throw new Error("No file selected");
    
    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0
    }));

    const storageRef = ref(storage, `vd-menu/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setState(prev => ({ ...prev, uploadProgress: progress }));
        },
        (error) => {
          setState(prev => ({
            ...prev,
            isUploading: false,
            uploadProgress: 0
          }));
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setState(prev => ({
              ...prev,
              isUploading: false,
              uploadProgress: 100
            }));
            resolve(downloadURL);
          } catch (error) {
            setState(prev => ({
              ...prev,
              isUploading: false,
              uploadProgress: 0
            }));
            reject(error);
          }
        }
      );
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    
    setState(prev => ({
      ...prev,
      formErrors: {
        ...prev.formErrors,
        image: null
      }
    }));

    if (!file) return;

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      setState(prev => ({
        ...prev,
        formErrors: {
          ...prev.formErrors,
          image: "File size must be under 5MB."
        }
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setState(prev => ({
        ...prev,
        formErrors: {
          ...prev.formErrors,
          image: "Invalid file type. Please select an image."
        }
      }));
      return;
    }

    try {
      const imageUrl = await uploadImage(file);
      setState(prev => ({
        ...prev,
        form: {
          ...prev.form,
          image: imageUrl
        }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        formErrors: {
          ...prev.formErrors,
          image: `Upload failed: ${error.message}`
        },
        form: {
          ...prev.form,
          image: null
        }
      }));
      e.target.value = null;
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.businessId) errors.businessId = "Business is required";
    if (!form.category) errors.category = "Category is required";
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.description.trim()) errors.description = "Description is required";
    
    const price = parseFloat(form.price);
    if (isNaN(price)) {
      errors.price = "Price must be a number";
    } else if (price < 0) {
      errors.price = "Price cannot be negative";
    }

    setState(prev => ({ ...prev, formErrors: errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    const itemData = {
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId: form.category,
      businessId: form.businessId,
      price: parseFloat(form.price),
      status: form.status,
      ...(form.image && { image: form.image }),
    };

    try {
      if (editingItem) {
        await api.patch(`/api/v1/items/${editingItem._id}`, itemData);
      } else {
        await api.post("/api/v1/items", itemData);
      }

      setState(prev => ({
        ...prev,
        open: false,
        isSubmitting: false
      }));
      resetFormAndEditingState();
      fetchItems();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Failed to save item: ${err.response?.data?.message || err.message}`,
        isSubmitting: false
      }));
    }
  };

  const handleEdit = (item) => {
    setState(prev => ({
      ...prev,
      editingItem: item,
      form: {
        name: item.name || "",
        description: item.description || "",
        businessId: item.businessId?._id || "",
        category: item.categoryId?._id || "",
        price: item.price?.toString() || "",
        status: item.status || "active",
        image: item.image || null,
      },
      formErrors: {},
      error: null,
      open: true
    }));
  };

  const resetFormAndEditingState = () => {
    setState(prev => ({
      ...prev,
      form: INITIAL_FORM_STATE,
      editingItem: null,
      formErrors: {},
      error: null,
      dialogCategories: [],
      uploadProgress: 0,
      isUploading: false
    }));
  };

  const handleDeleteRequest = (itemId) => {
    setState(prev => ({
      ...prev,
      deleteId: itemId,
      confirmOpen: true,
      error: null
    }));
  };

  const handleDeleteConfirm = async () => {
    setState(prev => ({ ...prev, error: null }));

    try {
      await api.delete(`/api/v1/items/${deleteId}`);
      
      setState(prev => ({
        ...prev,
        confirmOpen: false,
        deleteId: null
      }));

      if (items.length === 1 && pageNumber > 1) {
        setState(prev => ({ ...prev, pageNumber: prev.pageNumber - 1 }));
      } else {
        fetchItems();
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: `Failed to delete item: ${err.response?.data?.message || err.message}`,
        confirmOpen: false
      }));
    }
  };

  const handleCloseDialog = () => {
    setState(prev => ({ ...prev, open: false }));
    resetFormAndEditingState();
  };

  const handleOpenAddDialog = () => {
    resetFormAndEditingState();
    setState(prev => ({ ...prev, open: true }));
  };

  const handlePageChange = (event, newPage) => {
    setState(prev => ({ ...prev, pageNumber: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event) => {
    setState(prev => ({
      ...prev,
      pageSize: parseInt(event.target.value, 10),
      pageNumber: 1
    }));
  };

  const handleFilterChange = (name, value) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [name]: value,
        ...(name === 'business' && { category: "" })
      },
      pageNumber: 1
    }));
  };

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Helmet>
          <title>Item Management</title>
        </Helmet>
        
        {/* Header Section */}
        <Card sx={{ mb: 3, boxShadow: theme.shadows[1] }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="600" color="text.primary">
                Item Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAddDialog}
                disabled={isLoading || isSubmitting}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                Add Item
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setState(prev => ({ ...prev, error: null }))}
          >
            {error}
          </Alert>
        )}

        {/* Filter Section */}
        <Card sx={{ mb: 3, boxShadow: theme.shadows[1] }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Search Items"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                  InputProps={{
                    sx: { borderRadius: 1 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Business"
                  variant="outlined"
                  size="small"
                  value={filters.business}
                  onChange={(e) => handleFilterChange('business', e.target.value)}
                  disabled={isLoading || businesses.length === 0}
                >
                  <MenuItem value="">All Businesses</MenuItem>
                  {businesses.map((b) => (
                    <MenuItem key={b._id} value={b._id}>
                      {b.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Category"
                  variant="outlined"
                  size="small"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  disabled={isLoading || !filters.business || categories.length === 0}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card sx={{ boxShadow: theme.shadows[1] }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                <TableRow>
                  <TableCell sx={{ width: 80 }}>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={30} sx={{ mr: 1 }} />
                      <Typography variant="body1">Loading Items...</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item._id} hover>
                      <TableCell>
                        <Avatar
                          src={item.image}
                          alt={item.name}
                          sx={{ width: 48, height: 48 }}
                          variant="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.categoryId?.name || "N/A"} 
                          size="small" 
                          color="secondary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary">
                          ${item.price?.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={item.status === "active" ? "success" : "default"}
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEdit(item)}
                            size="small"
                            color="primary"
                            disabled={isSubmitting}
                            sx={{ mr: 1 }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteRequest(item._id)}
                            size="small"
                            color="error"
                            disabled={isSubmitting}
                          >
                            <DeleteTwoToneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1">
                        No items found matching your criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalItems}
            page={pageNumber - 1}
            onPageChange={handlePageChange}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog 
          open={open} 
          onClose={handleCloseDialog} 
          fullWidth 
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {editingItem ? "Edit Item" : "Add New Item"}
            <IconButton
              onClick={handleCloseDialog}
              disabled={isSubmitting || isUploading}
              color="inherit"
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setState(prev => ({ ...prev, error: null }))}>
                {error}
              </Alert>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Business"
                  name="businessId"
                  value={form.businessId}
                  onChange={handleFormChange}
                  required
                  error={!!formErrors.businessId}
                  helperText={formErrors.businessId}
                  disabled={isSubmitting || isLoading || editingItem}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="" disabled>
                    Select a Business
                  </MenuItem>
                  {businesses.map((bus) => (
                    <MenuItem key={bus._id} value={bus._id}>
                      {bus.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  required
                  error={!!formErrors.category}
                  helperText={formErrors.category}
                  disabled={isSubmitting || !form.businessId || dialogCategories.length === 0}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="" disabled>
                    Select a Category
                  </MenuItem>
                  {dialogCategories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item Name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={isSubmitting}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  required
                  multiline
                  rows={3}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  disabled={isSubmitting}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Item Image
                  </Typography>
                  
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.default'
                    }}
                  >
                    {form.image ? (
                      <>
                        <Box
                          component="img"
                          src={form.image}
                          alt="Preview"
                          sx={{
                            maxHeight: 150,
                            maxWidth: '100%',
                            mb: 2,
                            borderRadius: 1
                          }}
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => setState(prev => ({
                            ...prev,
                            form: {
                              ...prev.form,
                              image: null
                            }
                          }))}
                          disabled={isSubmitting}
                        >
                          Remove Image
                        </Button>
                      </>
                    ) : (
                      <>
                        <CloudUpload fontSize="large" color="action" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Drag and drop an image here, or click to select
                        </Typography>
                        <Button
                          variant="contained"
                          component="label"
                          disabled={isSubmitting || isUploading}
                        >
                          Upload Image
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          Max file size: 5MB
                        </Typography>
                      </>
                    )}
                  </Box>

                  {isUploading && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                      <Typography variant="caption" display="block" textAlign="center">
                        Uploading: {Math.round(uploadProgress)}%
                      </Typography>
                    </Box>
                  )}

                  {formErrors.image && (
                    <Typography color="error" variant="caption">
                      {formErrors.image}
                    </Typography>
                  )}
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleFormChange}
                  required
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  disabled={isSubmitting}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { step: "0.01", min: "0" },
                  }}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  disabled={isSubmitting}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  {["active", "inactive"].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              onClick={handleCloseDialog}
              disabled={isSubmitting || isUploading}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
              sx={{ minWidth: 120 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : editingItem ? (
                "Update Item"
              ) : (
                "Add Item"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmOpen}
          message="Are you sure you want to delete this item? This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onClose={() => setState(prev => ({ ...prev, confirmOpen: false }))}
        />
      </Box>
    </MainLayout>
  );
};

export default ItemManagement;