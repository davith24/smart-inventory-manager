import * as React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import { extendTheme } from "@mui/material/styles";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useSelector } from "react-redux";
import {
  CategoryOutlined,
  List,
  Settings,
  Telegram,
} from "@mui/icons-material";

// Navigation Config
const NAVIGATION = [
  { kind: "header", title: "Main" },
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  { kind: "divider" },
  { kind: "header", title: "Inventory" },
  {
    segment: "categories-management",
    title: "Categories Management",
    icon: <CategoryOutlined />,
  },
  {
    segment: "products-management",
    title: "Products Management",
    icon: <List />,
  },
  { kind: "divider" },
  { kind: "header", title: "Customers" },
  {
    segment: "sales-management",
    title: "Sales Management",
    icon: <PointOfSaleIcon />,
  },
  {
    segment: "customers-management",
    title: "Customers Management",
    icon: <Telegram />,
  },
  { kind: "divider" },
  { kind: "header", title: "Settings" },
  {
    segment: "settings",
    title: "Settings",
    icon: <Settings />,
  },
];

const demoTheme = extendTheme({
  colorSchemes: { light: {}, dark: {} },
  colorSchemeSelector: "class",
});

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

const getHeaderTitleByRole = (nav, roles) => {
  const header = nav.find(
    (item) =>
      item.kind === "header" && item.roles?.some((role) => roles.includes(role))
  );
  return header?.title || "VD Menu";
};

const Header = ({ title }) => (
  <div className="p-4 bg-white shadow-md">
    <h1 className="text-xl font-semibold">{title}</h1>
  </div>
);

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
          <div className="p-4">{children}</div>
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
};

export default MainLayout;
