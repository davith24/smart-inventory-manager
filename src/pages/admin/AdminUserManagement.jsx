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
  DialogContentText,
  DialogActions,
  Tooltip,
  TablePagination,
  Chip,
  Avatar,
  Card,
  CardContent,
  InputAdornment,
  TextField,
  Divider,
  useTheme,
  alpha,
  Badge
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axiosConfig";
import { 
  Edit, 
  Delete, 
  Add, 
  PersonAdd, 
  Search, 
  Refresh, 
  FilterList,
  PersonOutline
} from "@mui/icons-material";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";

const ConfirmDialog = ({ message, onConfirm, onClose, open, userName }) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    PaperProps={{
      sx: {
        borderRadius: 2,
        minWidth: "400px"
      }
    }}
  >
    <DialogTitle sx={{ pb: 1, fontWeight: "medium" }}>Confirm User Deletion</DialogTitle>
    <DialogContent>
      <DialogContentText>
        {message} {userName && <strong>{userName}</strong>}?
      </DialogContentText>
      <DialogContentText sx={{ mt: 2, color: "error.main" }}>
        This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} variant="outlined">
        Cancel
      </Button>
      <Button 
        variant="contained" 
        color="error" 
        onClick={onConfirm}
        startIcon={<Delete />}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

const AdminUserManagement = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.user;
  const token = currentUser?.token;
  const navigate = useNavigate();
  const theme = useTheme();

  const title = "User Management";

  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNumber, setPageNumber] = useState(0); // Changed to 0-based for MUI compatibility
  const [pageSize, setPageSize] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePageChange = (event, newPage) => {
    setPageNumber(newPage);
  };

  const handleLimitChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPageNumber(0); // Reset to first page when changing page size
  };

  const getUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // API expects 1-based pagination, but MUI uses 0-based
      const res = await api.get(
        `api/v1/users?page=${pageNumber + 1}&limit=${pageSize}${searchTerm ? `&search=${searchTerm}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (res.data && res.data.data) {
        setUsers(res.data.data);
        setTotalItems(res.data.data.total || 0);
      } else {
        setUsers({ data: [], total: 0 });
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error?.response?.data?.message || "Failed to fetch users");
      setUsers({ data: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await api.delete(`api/v1/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.message || "User deleted successfully");
      getUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error?.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    getUsers();
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setRefreshTrigger(prev => prev + 1);
  };

  const getRoleColor = (role) => {
    const roles = {
      "Admin": "error",
      "Manager": "warning",
      "User": "primary",
      "Customer": "success",
      "Moderator": "secondary",
    };
    return roles[role] || "default";
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return theme.palette.primary.main;
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
    ];
    
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    
    return colors[sum % colors.length];
  };

  // Fetch users when page, pageSize or searchTerm changes
  useEffect(() => {
    getUsers();
  }, [pageNumber, pageSize, refreshTrigger]);

  return (
    <MainLayout>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Box sx={{ padding: { xs: 2, md: 4 } }}>
        <Card elevation={0} sx={{ mb: 4, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
          <CardContent sx={{ py: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  {title}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Manage users, roles and permissions
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                component={Link} 
                to="/admin/users/0"
                startIcon={<PersonAdd />}
                size="large"
                sx={{ 
                  borderRadius: 8, 
                  px: 3,
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                  }
                }}
              >
                Add New User
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent sx={{ py: 2 }}>
            <Box 
              component="form" 
              onSubmit={handleSearch}
              display="flex" 
              alignItems="center" 
              gap={2}
              flexWrap="wrap"
            >
              <TextField
                placeholder="Search users..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Box>
                <Button 
                  type="submit" 
                  variant="contained" 
                  sx={{ borderRadius: 2, mr: 1 }}
                >
                  Search
                </Button>
                <Tooltip title="Reset filters">
                  <IconButton onClick={handleRefresh} color="default">
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ borderRadius: 2 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                  <TableCell>User</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Loading />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 5, color: "error.main" }}
                    >
                      <Typography variant="body1" gutterBottom>{error}</Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        sx={{ mt: 2 }}
                      >
                        Try Again
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : users?.data?.length > 0 ? (
                  users.data.map((user, index) => (
                    <TableRow 
                      key={user._id || index}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.primary.main, 0.04)
                        },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ 
                              bgcolor: getAvatarColor(user.name),
                              mr: 2
                            }}
                          >
                            {getInitials(user.name)}
                          </Avatar>
                          <Typography variant="body1">{user.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.roleId?.name || "Unknown"} 
                          size="small"
                          color={getRoleColor(user.roleId?.name)} 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(user.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="Edit User">
                            <IconButton
                              component={Link}
                              to={`/admin/users/${user._id}`}
                              sx={{ 
                                color: theme.palette.primary.main,
                                '&:hover': { 
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              onClick={() => {
                                setConfirmOpen(true);
                                setDeleteId(user._id);
                                setDeleteUserName(user.name);
                              }}
                              sx={{ 
                                color: theme.palette.error.main,
                                '&:hover': { 
                                  backgroundColor: alpha(theme.palette.error.main, 0.1)
                                }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <PersonOutline sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.6 }} />
                        <Typography variant="h6" color="textSecondary">
                          No users found
                        </Typography>
                        {searchTerm && (
                          <Typography variant="body2" color="textSecondary">
                            Try adjusting your search criteria
                          </Typography>
                        )}
                        <Button 
                          variant="outlined" 
                          startIcon={<Add />}
                          component={Link}
                          to="/admin/users/0"
                          sx={{ mt: 1 }}
                        >
                          Add First User
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box p={2} display="flex" justifyContent="flex-end">
            <TablePagination
              component="div"
              count={totalItems || 0}
              page={pageNumber}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handleLimitChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Users per page:"
            />
          </Box>
        </Card>
        
        <ConfirmDialog
          open={confirmOpen}
          message="Are you sure you want to delete this user:"
          userName={deleteUserName}
          onConfirm={() => handleDelete(deleteId)}
          onClose={() => setConfirmOpen(false)}
        />
      </Box>
    </MainLayout>
  );
};

export default AdminUserManagement;