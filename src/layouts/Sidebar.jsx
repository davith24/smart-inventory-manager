import * as React from "react";
import { 
  Box, 
  Divider, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Collapse,
  ListItemButton,
  Tooltip,
  Avatar,
  useTheme,
  IconButton
} from "@mui/material";
import {
  Dashboard,
  People,
  Settings,
  Assignment,
  Analytics,
  WorkspacePremium,
  Subscriptions,
  ChevronLeft,
  MenuOpen,
  ExpandLess,
  ExpandMore,
  Store,
  CategoryOutlined,
  ListAlt,
  Telegram,
  Person,
  Logout
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = ({ open, toggleSidebar }) => {
  const location = useLocation();
  const theme = useTheme();
  
  // Get user data from Redux store
  const { currentUser } = useSelector((state) => state.user || { currentUser: null });
  const user = currentUser?.user || {};
  const userRole = user?.roleId?.slug || "user"; // Default to "user" if not available
  const userName = user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  
  // Track open submenus
  const [openSubMenu, setOpenSubMenu] = React.useState({});
  
  // Toggle submenu open/closed
  const handleToggleSubMenu = (index) => {
    setOpenSubMenu(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Main menu items
  const menuItems = [
    { 
      text: "Dashboard", 
      icon: <Dashboard />, 
      path: userRole === "admin" ? "/admin/dashboard" : "/client/dashboard",
      roles: ["admin", "user"] 
    },
    {
      text: "User Management",
      icon: <People />,
      path: "/admin/user-management",
      roles: ["admin"],
    },
    {
      text: "Role Management",
      icon: <Settings />,
      path: "/admin/role-management",
      roles: ["admin"],
    },
    {
      text: "Business Management",
      icon: <Store />,
      path: "/client/business-management",
      roles: ["user"],
      submenu: [
        {
          text: "Categories",
          icon: <CategoryOutlined />,
          path: "/client/category-management",
          roles: ["user"],
        },
        {
          text: "Items",
          icon: <ListAlt />,
          path: "/client/item-management",
          roles: ["user"],
        }
      ]
    },
    {
      text: "Subscription Plans",
      icon: <WorkspacePremium />,
      path: "/admin/subscription-plan-management",
      roles: ["admin"],
    },
    {
      text: "User Subscriptions",
      icon: <Subscriptions />,
      path: "/admin/user-subscription-plan-management",
      roles: ["admin", "user"],
    },
    {
      text: "Telegram Management",
      icon: <Telegram />,
      path: "/client/telegram-management",
      roles: ["user"],
    },
    {
      text: "Business Lists",
      icon: <Store />,
      path: "/admin/business-lists",
      roles: ["admin"],
    },
    {
      text: "Reports",
      icon: <Assignment />,
      path: "/admin/reports",
      roles: ["admin"],
    },
    {
      text: "Analysis",
      icon: <Analytics />,
      path: "/admin/analysis",
      roles: ["admin", "user"],
    },
    {
      text: "Settings",
      icon: <Settings />,
      path: userRole === "admin" ? "/admin/settings" : "/client/settings",
      roles: ["admin", "user"],
    }
  ];

  // Filter items based on user role
  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  // Determine if a path is active (exact or parent match)
  const isPathActive = (path) => {
    // Exact match
    if (location.pathname === path) return true;
    
    // Parent path match (for submenu items)
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    
    return false;
  };

  const drawerWidth = 260;

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : theme.spacing(9),
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        flexShrink: 0,
        whiteSpace: 'nowrap',
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : theme.spacing(9),
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          boxSizing: "border-box",
          bgcolor: "background.paper",
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          padding: theme.spacing(2),
          bgcolor: "primary.main",
          color: "white",
          minHeight: 64
        }}
      >
        {open && (
          <Typography variant="h6" fontWeight="bold" noWrap>
            {userRole === "admin" ? "Admin Panel" : "Client Portal"}
          </Typography>
        )}
        <IconButton 
          onClick={toggleSidebar} 
          sx={{ color: "white" }}
        >
          {open ? <ChevronLeft /> : <MenuOpen />}
        </IconButton>
      </Box>

      <Divider />
      
      {open && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            py: 2 
          }}
        >
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: theme.palette.primary.main,
              mb: 1
            }}
          >
            {userInitial}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="medium">
            {userName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userRole === "admin" ? "Administrator" : "Client User"}
          </Typography>
        </Box>
      )}
      
      <Divider />

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 'calc(100% - 170px)'
        }}
      >
        <List sx={{ px: 1 }}>
          {filteredMenuItems.map((item, index) => {
            const isActive = isPathActive(item.path);
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = openSubMenu[index] || false;

            return (
              <React.Fragment key={item.text}>
                {hasSubmenu ? (
                  <>
                    <ListItemButton
                      onClick={() => handleToggleSubMenu(index)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        bgcolor: isActive ? "primary.main" : "transparent",
                        color: isActive ? "white" : "text.primary",
                        "&:hover": {
                          bgcolor: isActive 
                            ? "primary.dark" 
                            : theme.palette.mode === 'light'
                              ? 'rgba(0, 0, 0, 0.04)'
                              : 'rgba(255, 255, 255, 0.08)'
                        },
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          minWidth: 36, 
                          color: isActive ? "white" : "inherit" 
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {open && (
                        <>
                          <ListItemText primary={item.text} />
                          {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                        </>
                      )}
                    </ListItemButton>
                    
                    {open && (
                      <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.submenu
                            .filter(subItem => !subItem.roles || subItem.roles.includes(userRole))
                            .map((subItem) => {
                              const isSubActive = location.pathname === subItem.path;
                              
                              return (
                                <ListItemButton
                                  key={subItem.text}
                                  component={Link}
                                  to={subItem.path}
                                  sx={{
                                    pl: 4,
                                    borderRadius: 1,
                                    mb: 0.5,
                                    bgcolor: isSubActive ? "primary.main" : "transparent",
                                    color: isSubActive ? "white" : "text.primary",
                                    "&:hover": {
                                      bgcolor: isSubActive ? "primary.dark" : 'rgba(0, 0, 0, 0.04)',
                                    },
                                  }}
                                >
                                  <ListItemIcon 
                                    sx={{ 
                                      minWidth: 36, 
                                      color: isSubActive ? "white" : "inherit" 
                                    }}
                                  >
                                    {subItem.icon}
                                  </ListItemIcon>
                                  <ListItemText primary={subItem.text} />
                                </ListItemButton>
                              );
                            })
                          }
                        </List>
                      </Collapse>
                    )}
                  </>
                ) : (
                  <Tooltip 
                    title={open ? "" : item.text} 
                    placement="right"
                    arrow
                  >
                    <ListItem
                      button
                      component={Link}
                      to={item.path}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        px: 2,
                        py: 1,
                        bgcolor: isActive ? "primary.main" : "transparent",
                        color: isActive ? "white" : "text.primary",
                        "&:hover": {
                          bgcolor: isActive 
                            ? "primary.dark" 
                            : theme.palette.mode === 'light'
                              ? 'rgba(0, 0, 0, 0.04)'
                              : 'rgba(255, 255, 255, 0.08)'
                        },
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          minWidth: 36, 
                          color: isActive ? "white" : "inherit",
                          mr: open ? 2 : 'auto',
                          justifyContent: 'center',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {open && <ListItemText primary={item.text} />}
                    </ListItem>
                  </Tooltip>
                )}
              </React.Fragment>
            );
          })}
        </List>
        
        {/* Footer items (profile, logout) */}
        <List sx={{ mt: 'auto', px: 1 }}>
          <Divider sx={{ my: 1 }} />
          <Tooltip 
            title={open ? "" : "Profile"} 
            placement="right"
            arrow
          >
            <ListItem
              button
              component={Link}
              to="/profile"
              sx={{
                borderRadius: 1,
                mb: 0.5,
                px: 2,
                py: 1,
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 36,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <Person />
              </ListItemIcon>
              {open && <ListItemText primary="Profile" />}
            </ListItem>
          </Tooltip>
          
          <Tooltip 
            title={open ? "" : "Logout"} 
            placement="right"
            arrow
          >
            <ListItem
              button
              sx={{
                borderRadius: 1,
                mb: 0.5,
                px: 2,
                py: 1,
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 36,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <Logout />
              </ListItemIcon>
              {open && <ListItemText primary="Logout" />}
            </ListItem>
          </Tooltip>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;