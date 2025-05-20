import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Tooltip,
  Divider,
  ListItemIcon,
  useTheme,
  Button,
  Breadcrumbs,
  Link,
  useMediaQuery
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { 
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Help as HelpIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  BusinessCenter as BusinessCenterIcon,
  Home as HomeIcon
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

// Styled Components
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  maxWidth: "400px",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
  transition: theme.transitions.create("width"),
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#ff4444",
    color: "#fff",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  border: `2px solid ${theme.palette.background.paper}`,
  cursor: "pointer",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const Topbar = ({ isDarkMode, toggleDarkMode, toggleSidebar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current user from Redux store
  const { currentUser } = useSelector((state) => state.user || { currentUser: null });
  const user = currentUser?.user || {};
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
  // Mock notifications
  const notifications = [
    { id: 1, title: "New subscription", message: "Someone subscribed to your service", time: "5 minutes ago", unread: true },
    { id: 2, title: "New order", message: "You have a new order to process", time: "1 hour ago", unread: true },
    { id: 3, title: "Payment success", message: "Payment was successful", time: "3 hours ago", unread: true },
    { id: 4, title: "System update", message: "System will be updated tonight", time: "1 day ago", unread: false },
  ];
  
  const unreadCount = notifications.filter(n => n.unread).length;
  
  // Convert path to breadcrumbs
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    if (pathnames.length === 0) return [{ name: 'Home', path: '/' }];
    
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    let currentPath = '';
    
    pathnames.forEach((value, index) => {
      currentPath += `/${value}`;
      const formattedName = value
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        name: formattedName,
        path: currentPath
      });
    });
    
    return breadcrumbs;
  };
  
  // Handlers
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleViewProfile = () => {
    navigate("/profile");
    handleProfileMenuClose();
  };

  const handleSignOut = () => {
    // Add sign out logic
    console.log("Sign Out clicked");
    handleProfileMenuClose();
  };
  
  const handleNotificationClick = (id) => {
    console.log(`Notification ${id} clicked`);
    handleNotificationMenuClose();
  };
  
  const breadcrumbs = getBreadcrumbs();

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        backgroundImage: theme.palette.mode === 'dark' 
          ? 'linear-gradient(to right, #1e3c72, #2a5298)'
          : 'linear-gradient(to right, #1976d2, #1976d2)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left section: Menu toggle & breadcrumbs */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={toggleSidebar}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          {!isMobile && (
            <Breadcrumbs 
              aria-label="breadcrumb" 
              sx={{ 
                color: "white",
                "& .MuiBreadcrumbs-ol": { alignItems: "center" },
                "& .MuiBreadcrumbs-li": { display: "flex", alignItems: "center" }
              }}
              separator="›"
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const icon = index === 0 
                  ? <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
                  : index === 1 && breadcrumbs[1].name.includes("Dashboard")
                    ? <DashboardIcon fontSize="small" sx={{ mr: 0.5 }} />
                    : breadcrumbs[1].name.includes("Business")
                      ? <BusinessCenterIcon fontSize="small" sx={{ mr: 0.5 }} />
                      : null;
                
                return isLast ? (
                  <Typography 
                    key={crumb.path} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 600
                    }}
                  >
                    {icon}
                    {crumb.name}
                  </Typography>
                ) : (
                  <Link
                    key={crumb.path}
                    color="inherit"
                    href={crumb.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(crumb.path);
                    }}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: 'white'
                      }
                    }}
                  >
                    {icon}
                    {crumb.name}
                  </Link>
                );
              })}
            </Breadcrumbs>
          )}
        </Box>

        {/* Center section: Search */}
        {!isMobile && (
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
        )}

        {/* Right section: Icons & Avatar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Help Button */}
          <Tooltip title="Help">
            <IconButton color="inherit">
              <HelpIcon />
            </IconButton>
          </Tooltip>

          {/* Notification Icon */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit"
              onClick={handleNotificationMenuOpen}
            >
              <StyledBadge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </StyledBadge>
            </IconButton>
          </Tooltip>

          {/* Notification Menu */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                width: 320,
                maxHeight: 400,
                mt: 1,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  borderLeft: 2,
                }
              }
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Notifications</Typography>
              <Button size="small">Mark all as read</Button>
            </Box>
            
            <Divider />
            
            {notifications.length > 0 ? (
              <>
                {notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    sx={{
                      borderLeftColor: notification.unread 
                        ? theme.palette.primary.main 
                        : 'transparent',
                      backgroundColor: notification.unread 
                        ? alpha(theme.palette.primary.light, 0.1) 
                        : 'transparent',
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" fontWeight={notification.unread ? 700 : 400}>
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {notification.message}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
                
                <Divider />
                
                <Box sx={{ textAlign: 'center', p: 1.5 }}>
                  <Button size="small" color="primary">
                    View All Notifications
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No notifications</Typography>
              </Box>
            )}
          </Menu>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Box sx={{ mr: 1, textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                  {user?.name || 'User Name'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                  {user?.roleId?.name || 'Role'}
                </Typography>
              </Box>
            )}
            
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                edge="end"
                aria-haspopup="true"
              >
                <UserAvatar 
                  alt={user?.name} 
                  src={user?.avatar}
                  sx={{ bgcolor: user?.avatar ? 'transparent' : theme.palette.primary.dark }}
                >
                  {(!user?.avatar && user?.name) ? user.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
                </UserAvatar>
              </IconButton>
            </Tooltip>
          </Box>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" noWrap>
                {user?.name || 'User Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
            
            <Divider />
            
            <MenuItem onClick={handleViewProfile}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>
            
            <MenuItem onClick={() => navigate("/settings")}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;