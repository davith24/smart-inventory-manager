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
  TablePagination,
  MenuItem,
  Chip,
  Stack,
  Alert,
  Container,
  alpha,
  useTheme,
  Divider
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import { Add, Edit, Delete, Refresh, CheckCircleOutline, Cancel } from "@mui/icons-material";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Loading from "../../components/Loading";
import api from "../../api/axiosConfig";

const RoleFormDialog = ({ open, onClose, onSubmit, role, loading }) => {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (role && open) {
      setName(role.name || "");
      setDescription(role.description || "");
      setStatus(role.status || "active");
      setNameError("");
    }
  }, [role, open]);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setStatus("active");
      setNameError("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError("Role name is required");
      return;
    }

    const formData = {
      ...role,
      name,
      description,
      status,
    };

    onSubmit(formData);
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        elevation: 5,
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 1, 
          pt: 2.5,
          px: 3,
          fontWeight: 600,
          fontSize: '1.25rem',
          color: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.light, 0.08)
        }}
      >
        {role ? "Edit Role" : "Add New Role"}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3, px: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 3, color: 'text.secondary', fontWeight: 500 }}>
          {role ? "Update role details below" : "Complete the form to create a new role"}
        </Typography>
        
        <TextField
          fullWidth
          label="Role Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setNameError("");
          }}
          margin="normal"
          required
          error={!!nameError}
          helperText={nameError}
          autoFocus
          InputLabelProps={{ 
            shrink: true,
            sx: { fontWeight: 500 }
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              fontWeight: 500,
              fontSize: '0.95rem'
            }
          }}
        />
        
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
          placeholder="Enter role description (optional)"
          InputLabelProps={{ 
            shrink: true,
            sx: { fontWeight: 500 }
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              fontSize: '0.95rem'
            }
          }}
        />
        
        <TextField
          fullWidth
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          margin="normal"
          InputLabelProps={{ 
            shrink: true,
            sx: { fontWeight: 500 }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontWeight: 500,
              fontSize: '0.95rem'
            },
            '& .MuiMenuItem-root': {
              fontSize: '0.95rem'
            }
          }}
        >
          <MenuItem value="active" sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutline sx={{ color: theme.palette.success.main, mr: 1, fontSize: '1rem' }} />
            Active
          </MenuItem>
          <MenuItem value="inactive" sx={{ display: 'flex', alignItems: 'center' }}>
            <Cancel sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: '1rem' }} />
            Inactive
          </MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          color="inherit"
          variant="outlined"
          sx={{ 
            fontWeight: 500,
            borderRadius: 1.5,
            textTransform: 'none',
            px: 2.5
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={loading}
          startIcon={loading ? <Loading size={20} /> : null}
          sx={{ 
            fontWeight: 600,
            borderRadius: 1.5,
            textTransform: 'none',
            px: 2.5,
            boxShadow: 2
          }}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ConfirmDialog = ({ message, onConfirm, onClose, open, loading }) => {
  const theme = useTheme();
  
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      PaperProps={{
        elevation: 5,
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 1, 
          pt: 2.5,
          px: 3,
          fontWeight: 600,
          fontSize: '1.15rem',
          color: theme.palette.error.main,
          backgroundColor: alpha(theme.palette.error.light, 0.08)
        }}
      >
        Confirmation Required
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5, px: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
        <Button 
          onClick={onClose} 
          disabled={loading} 
          color="inherit"
          variant="outlined"
          sx={{ 
            fontWeight: 500,
            borderRadius: 1.5,
            textTransform: 'none',
            px: 2.5
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <Loading size={20} /> : <Delete />}
          sx={{ 
            fontWeight: 600,
            borderRadius: 1.5,
            textTransform: 'none',
            px: 2.5,
            boxShadow: 2
          }}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminRoleManagement = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.token;

  const title = "Role Management";

  const [roles, setRoles] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await api.get("/api/v1/roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: page + 1,
          limit: rowsPerPage
        }
      });
      
      setRoles(res.data.data?.data || []);
      setTotalItems(res.data.data?.total || 0);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch roles";
      toast.error(errorMessage);
      setError(errorMessage);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (roleData) => {
    setLoading(true);
    try {
      if (roleData._id) {
        const res = await api.patch(`/api/v1/roles/${roleData._id}`, roleData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success(res.data.message || "Role updated successfully");
      } else {
        const res = await api.post("/api/v1/roles", roleData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success(res.data.message || "Role created successfully");
      }
      setFormOpen(false);
      setSelectedRole(null);
      setRefreshKey(prev => prev + 1); // Trigger refresh
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await api.delete(`/api/v1/roles/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(res.data.message || "Role deleted successfully");
      setRefreshKey(prev => prev + 1); // Trigger refresh
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting role");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchRoles();
  }, [page, rowsPerPage, refreshKey]);

  const theme = useTheme();

  return (
    <MainLayout>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Box 
        sx={{ 
          width: '100%', 
          backgroundColor: alpha(theme.palette.primary.light, 0.04),
          pt: 2,
          pb: 4,
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 2,
                backgroundColor: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography 
                    variant="h4" 
                    fontWeight={700}
                    color={theme.palette.primary.main}
                    sx={{ mb: 0.5 }}
                  >
                    {title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Create and manage user roles and permissions
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Refresh />} 
                    onClick={() => setRefreshKey(prev => prev + 1)}
                    disabled={loading}
                    sx={{ 
                      fontWeight: 600, 
                      borderRadius: 1.5,
                      textTransform: 'none',
                      px: 2.5,
                      py: 1
                    }}
                  >
                    Refresh
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => setFormOpen(true)}
                    sx={{ 
                      fontWeight: 600, 
                      borderRadius: 1.5,
                      textTransform: 'none',
                      px: 2.5,
                      py: 1,
                      boxShadow: 2
                    }}
                  >
                    Add Role
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  '& .MuiAlert-message': { fontWeight: 500 }
                }}
                variant="filled"
              >
                {error}
              </Alert>
            )}

            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`
              }}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  pl: 3,
                  bgcolor: alpha(theme.palette.grey[100], 0.6),
                  borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`
                }}
              >
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600}
                  color={theme.palette.text.primary}
                >
                  All Roles
                </Typography>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      backgroundColor: alpha(theme.palette.grey[100], 0.3),
                      '& th': { 
                        fontWeight: 600, 
                        fontSize: '0.875rem',
                        color: theme.palette.text.secondary,
                        py: 1.75
                      }
                    }}>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Slug</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Loading />
                            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                              Loading roles...
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : roles.length > 0 ? (
                      roles.map((role) => (
                        <TableRow 
                          key={role._id} 
                          hover
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: alpha(theme.palette.primary.light, 0.04) 
                            },
                            '& td': { 
                              py: 1.75,
                              fontSize: '0.925rem',
                              fontWeight: 500 
                            }
                          }}
                        >
                          <TableCell sx={{ 
                            maxWidth: 100, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            color: alpha(theme.palette.text.primary, 0.75),
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            fontWeight: 400
                          }}>
                            <Tooltip title={role._id}>
                              <span>{role._id}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{role.name}</TableCell>
                          <TableCell sx={{ color: theme.palette.primary.main }}>{role.slug}</TableCell>
                          <TableCell sx={{ 
                            maxWidth: 200,
                            color: alpha(theme.palette.text.primary, 0.8),
                            fontWeight: 400
                          }}>
                            {role.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={role.status === "active" ? "Active" : "Inactive"}
                              color={role.status === "active" ? "success" : "default"}
                              size="small"
                              sx={{ 
                                fontWeight: 600, 
                                borderRadius: 1,
                                textTransform: 'capitalize',
                                '& .MuiChip-label': { px: 1 }
                              }}
                              icon={role.status === "active" ? 
                                <CheckCircleOutline sx={{ fontSize: '0.85rem', ml: 0.5 }} /> : 
                                <Cancel sx={{ fontSize: '0.85rem', ml: 0.5 }} />
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="Edit Role">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setSelectedRole(role);
                                    setFormOpen(true);
                                  }}
                                  sx={{ 
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.15)
                                    }
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Role">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setDeleteId(role._id);
                                    setConfirmOpen(true);
                                  }}
                                  sx={{ 
                                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.error.main, 0.15)
                                    }
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                              No Roles Found
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                              Get started by adding your first role
                            </Typography>
                            <Button
                              variant="outlined"
                              startIcon={<Add />}
                              onClick={() => setFormOpen(true)}
                              sx={{ 
                                fontWeight: 600,
                                borderRadius: 1.5,
                                textTransform: 'none'
                              }}
                            >
                              Add New Role
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                component="div"
                count={totalItems}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  borderTop: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    fontWeight: 500
                  }
                }}
              />
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Dialogs */}
      <RoleFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedRole(null);
        }}
        onSubmit={handleCreateOrUpdate}
        role={selectedRole}
        loading={loading}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this role? This action cannot be undone."
        loading={loading}
      />
    </MainLayout>
  );
};

export default AdminRoleManagement;