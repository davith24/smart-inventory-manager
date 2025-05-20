import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Button,
  Typography,
  Drawer,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  alpha,
  Badge
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close,
  Home,
  Info,
  ContactSupport,
  Dashboard,
  ExitToApp,
  Person,
  PersonAdd,
  KeyboardArrowDown
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import {
  signOutFailure,
  signOutStart,
  signOutSuccess,
} from "../app/user/userSlice";
import { toast } from "react-toastify";
import VDMenu from "../assets/Logo_VD_Menu.png"
// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

const LogoWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    opacity: 0.9,
  }
}));

const Logo = styled("img")({
  height: 38,
  borderRadius: 6,
});

const NavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  color: theme.palette.text.primary,
  fontWeight: 500,
  borderRadius: 8,
  padding: theme.spacing(0.8, 2),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '0%',
    height: 2,
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.3s ease',
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    '&:after': {
      width: '100%',
    },
  },
  '&.active': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    '&:after': {
      width: '100%',
    },
  },
}));

const SignButton = styled(Button)(({ theme, variant }) => ({
  margin: theme.spacing(0, 0.5),
  borderRadius: 20,
  padding: theme.spacing(0.8, 2.5),
  fontWeight: 600,
  boxShadow: variant === 'contained' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'contained' ? '0 6px 15px rgba(0, 0, 0, 0.2)' : 'none',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

// Custom active NavLink component
const StyledNavLink = ({ to, children, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={({ isActive }) => ({
        textDecoration: 'none',
      })}
      className={({ isActive }) => isActive ? 'active' : ''}
    >
      {children}
    </NavLink>
  );
};

const Navbar = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.user;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleSignOut = () => {
    dispatch(signOutStart());
    setLoading(true);
    try {
      dispatch(signOutSuccess());
      navigate("/signin");
      toast.success("Signout successful!");
      if (userMenuAnchor) handleUserMenuClose();
      if (drawerOpen) setDrawerOpen(false);
    } catch (error) {
      setLoading(false);
      dispatch(signOutFailure());
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, link: '/' },
    { text: 'About', icon: <Info />, link: '/about' },
    { text: 'Contact', icon: <ContactSupport />, link: '/contact' },
  ];

  return (
    <StyledAppBar elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo and Brand */}
          <StyledNavLink to="/">
            <LogoWrapper>
              <Logo
                src={VDMenu}
                alt="Logo"
              />
              <Typography
                variant="h6"
                sx={{
                  ml: 1.5,
                  fontWeight: 700,
                  color: 'primary.main',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                VD Menu
              </Typography>
            </LogoWrapper>
          </StyledNavLink>

          {/* Desktop Navigation Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {menuItems.map((item) => (
              <StyledNavLink key={item.text} to={item.link}>
                <NavButton>
                  {item.text}
                </NavButton>
              </StyledNavLink>
            ))}
          </Box>

          {/* Authentication Section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && user ? (
              <>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderRadius: 20,
                    px: 1.5,
                    py: 0.5,
                    '&:hover': { 
                      bgcolor: 'rgba(0, 0, 0, 0.04)' 
                    }
                  }}
                  onClick={handleUserMenuOpen}
                >
                  <StyledBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                  >
                    <Avatar 
                      alt={user?.name}
                      src={user?.profileImage || ''}
                      sx={{ 
                        width: 36, 
                        height: 36,
                        bgcolor: 'primary.main' 
                      }}
                    >
                      {user?.name?.charAt(0)}
                    </Avatar>
                  </StyledBadge>
                  <Box sx={{ ml: 1, mr: 0.5 }}>
                    <Typography color="text.secondary" variant="subtitle2">
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {user?.roleId?.slug === "admin" ? "Administrator" : "Client"}
                    </Typography>
                  </Box>
                  <KeyboardArrowDown fontSize="small" color="action" />
                </Box>

                {/* User dropdown menu */}
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      width: 220,
                      overflow: 'visible',
                      borderRadius: 2,
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
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleUserMenuClose} dense>
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                  </MenuItem>
                  <StyledNavLink
                    to={user?.roleId?.slug === "admin" ? "/admin/dashboard" : "/client/dashboard"}
                    onClick={handleUserMenuClose}
                  >
                    <MenuItem dense>
                      <ListItemIcon>
                        <Dashboard fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Dashboard</ListItemText>
                    </MenuItem>
                  </StyledNavLink>
                  <Divider />
                  <MenuItem onClick={handleSignOut} dense>
                    <ListItemIcon>
                      <ExitToApp fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" primaryTypographyProps={{ color: 'error' }} />
                  </MenuItem>
                </Menu>
              </>
            ) : !isMobile && !user ? (
              <Box sx={{ display: 'flex' }}>
                <StyledNavLink to="/signin">
                  <SignButton variant="outlined" color="primary">
                    Sign In
                  </SignButton>
                </StyledNavLink>
                <StyledNavLink to="/signup">
                  <SignButton variant="contained" color="primary">
                    Sign Up
                  </SignButton>
                </StyledNavLink>
              </Box>
            ) : null}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                size="large"
                aria-label="menu"
                onClick={handleDrawerToggle}
                color="primary"
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>

          {/* Mobile Drawer */}
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            PaperProps={{
              sx: { width: 280, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }
            }}
          >
            <DrawerHeader>
              <Typography variant="h6" fontWeight={600}>
                Menu
              </Typography>
              <IconButton 
                onClick={handleDrawerToggle}
                sx={{ color: 'inherit' }}
              >
                <Close />
              </IconButton>
            </DrawerHeader>
            
            {user && (
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  alt={user?.name} 
                  src={user?.profileImage || ''}
                  sx={{ 
                    width: 50, 
                    height: 50,
                    bgcolor: 'primary.main' 
                  }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            )}
            
            <Divider />
            
            <List>
              {menuItems.map((item) => (
                <StyledNavLink 
                  key={item.text} 
                  to={item.link}
                  onClick={handleDrawerToggle}
                >
                  <ListItem button>
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                </StyledNavLink>
              ))}
            </List>

            <Divider />

            <Box sx={{ p: 2 }}>
              {user ? (
                <>
                  <StyledNavLink
                    to={user?.roleId?.slug === "admin" ? "/admin/dashboard" : "/client/dashboard"}
                    onClick={handleDrawerToggle}
                  >
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<Dashboard />}
                      sx={{ mb: 1, borderRadius: 2 }}
                    >
                      Dashboard
                    </Button>
                  </StyledNavLink>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="error" 
                    onClick={handleSignOut}
                    startIcon={<ExitToApp />}
                    sx={{ borderRadius: 2 }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <StyledNavLink to="/signin" onClick={handleDrawerToggle}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      color="primary"
                      startIcon={<Person />}
                      sx={{ mb: 1, borderRadius: 2 }}
                    >
                      Sign In
                    </Button>
                  </StyledNavLink>
                  <StyledNavLink to="/signup" onClick={handleDrawerToggle}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary"
                      startIcon={<PersonAdd />} 
                      sx={{ borderRadius: 2 }}
                    >
                      Sign Up
                    </Button>
                  </StyledNavLink>
                </>
              )}
            </Box>
          </Drawer>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Navbar;