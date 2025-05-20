import * as React from "react";
import { extendTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useSelector } from "react-redux";
import {
  AdminPanelSettings,
  CategoryOutlined,
  List,
  PeopleOutline,
  Settings,
  Shop,
  Store,
  Telegram,
} from "@mui/icons-material";

// Navigation Config
const NAVIGATION = [
  { kind: "header", title: "Main" },
  {
    segment: "admin/dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    roles: ["admin"],
  },
  {
    segment: "client/dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    roles: ["user"],
  },
  { kind: "divider" },
  { kind: "header", title: "User Managments", roles: ["admin"] },
  {
    segment: "admin/role-management",
    title: "Role Management",
    icon: <AdminPanelSettings />,
    roles: ["admin"],
  },
  {
    segment: "admin/user-management",
    title: "User Management",
    icon: <PeopleOutline />,
    roles: ["admin"],
  },
  { kind: "header", title: "Business", roles: ["user"] },
  {
    segment: "client/business-management",
    title: "Business Management",
    icon: <Store />,
    roles: ["user"],
  },

  {
    segment: "client/category-management",
    title: "Category Management",
    icon: <CategoryOutlined />,
    roles: ["user"],
  },
  {
    segment: "client/item-management",
    title: "Item Management",
    icon: <List />,
    roles: ["user"],
  },

  { kind: "divider" },
  { kind: "header", title: "Subscription", roles: ["admin"] },
  {
    segment: "admin/subscription-plan-management",
    title: "Subscription Plan Management",
    icon: <ShoppingCartIcon />,
    roles: ["admin"],
  },
  {
    segment: "admin/user-subscription-plan-management",
    title: "User-Subscription Plan Management",
    icon: <BarChartIcon />,
    roles: ["admin"],
  },
  { kind: "header", title: "Contacts", roles: ["user"] },
  {
    segment: "client/telegram-management",
    title: "Telegram Management",
    icon: <Telegram />,
    roles: ["user"],
  },
  { kind: "divider" },
  { kind: "header", title: "Businesses", roles: ["admin"] },
  {
    segment: "admin/business-lists",
    title: "Business Lists",
    icon: <Store />,
    roles: ["admin"],
  },
  { kind: "header", title: "Orders", roles: ["user"] },

  { kind: "divider" },
  { kind: "header", title: "Reports & An  alysis" },
  {
    segment: "admin/reports",
    title: "Reports",
    icon: <DescriptionIcon />,
    roles: ["admin"],
  },
  {
    segment: "admin/analysis",
    title: "Analysis",
    icon: <BarChartIcon />,
    roles: ["admin"],
  },

  { kind: "divider" },
  { kind: "header", title: "Settings" },
  {
    segment: "admin/settings",
    title: "Settings",
    icon: <Settings />,
    roles: ["admin"],
  },
  {
    segment: "client/settings",
    title: "Settings",
    icon: <Settings />,
    roles: ["user"],
  },
];

// Theme Setup
const demoTheme = extendTheme({
  colorSchemes: { light: {}, dark: {} },
  colorSchemeSelector: "class",
});

// Navigation Filter Function
const filterNavigation = (nav, roles) =>
  nav
    .filter((item) => {
      if (!item.roles) return true;
      return item.roles.some((role) => roles.includes(role));
    })
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) =>
            child.roles?.some((role) => roles.includes(role))
          ),
        };
      }
      return item;
    });

// Extract header title by role
const getHeaderTitleByRole = (nav, roles) => {
  const header = nav.find(
    (item) =>
      item.kind === "header" && item.roles?.some((role) => roles.includes(role))
  );
  return header?.title || "VD Menu";
};

// Header component
const Header = ({ title }) => (
  <div className="p-4 bg-white shadow-md">
    <h1 className="text-xl font-semibold">{title}</h1>
  </div>
);

// Main layout component
const MainLayout = ({ children }) => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.user;

  const userRole = user?.roleId?.slug ? [user.roleId.slug] : [];

  const filteredNavigation = React.useMemo(() => {
    return filterNavigation(NAVIGATION, userRole);
  }, [userRole]);

  const headerTitle = React.useMemo(() => {
    return getHeaderTitleByRole(NAVIGATION, userRole);
  }, [userRole]);

  return (
    <AppProvider theme={demoTheme}>
      <DashboardLayout navigation={filteredNavigation}>
        <PageContainer>
          {/* <Header title={headerTitle} /> */}
          <div className="p-4">{children}</div>
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
};

export default MainLayout;
