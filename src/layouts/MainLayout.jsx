import * as React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  signOutFailure,
  signOutStart,
  signOutSuccess,
} from "../app/user/userSlice";
import { LogOut, List, Settings, Menu, TableCellsMerge } from "lucide-react";
import { useStockAlerts } from "../hook/useStockAlerts";

const NAVIGATION = [
  { kind: "header", title: "Main" },
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <Menu size={18} />,
  },
  { kind: "divider" },
  { kind: "header", title: "Inventory" },
  {
    segment: "categories-management",
    title: "Categories Management",
    icon: <Menu size={18} />,
  },
  {
    segment: "products-management",
    title: "Products Management",
    icon: <List size={18} />,
  },
  { kind: "divider" },
  { kind: "header", title: "Customers" },
  {
    segment: "stock-alerts",
    title: "Stock Alerts",
    icon: <TableCellsMerge size={18} />,
  },
  {
    segment: "stock-statement",
    title: "Stock Statement",
    icon: <TableCellsMerge size={18} />,
  },
  {
    segment: "sales-management",
    title: "Sales Management",
    icon: <TableCellsMerge size={18} />,
  },
  {
    segment: "customers-management",
    title: "Customers Management",
    icon: <TableCellsMerge size={18} />,
  },
  { kind: "divider" },
  { kind: "header", title: "Settings" },
  {
    segment: "settings",
    title: "Settings",
    icon: <Settings size={18} />,
  },
];

const filterNavigation = (nav, roles = []) =>
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

const Sidebar = ({ navigation }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      dispatch(signOutStart());
      localStorage.removeItem("token"); // or your actual session key
      dispatch(signOutSuccess());
      toast.success("Successfully signed out!");
      navigate("/signin");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage);
      dispatch(signOutFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-64 h-full bg-gray-100 p-4 space-y-4 flex flex-col justify-between">
      <div>
        {navigation.map((item, index) => {
          if (item.kind === "header") {
            return (
              <div
                key={index}
                className="text-gray-900 uppercase text-xs font-bold"
              >
                {item.title}
              </div>
            );
          } else if (item.kind === "divider") {
            return <hr key={index} className="my-2 border-gray-300" />;
          } else {
            return (
              <a
                key={index}
                href={`/${item.segment}`}
                className="flex items-center gap-2 text-gray-600 hover:bg-gray-400 p-2 rounded"
              >
                {item.icon}
                <span>{item.title}</span>
              </a>
            );
          }
        })}
      </div>

      <button
        onClick={handleSignOut}
        disabled={loading}
        className="flex items-center gap-2 text-white bg-red-500 hover:bg-red-600 p-2 rounded transition-colors disabled:opacity-50"
      >
        <LogOut size={18} />
        <span>{loading ? "Signing out..." : "Sign Out"}</span>
      </button>
    </aside>
  );
};

const MainLayout = ({ children }) => {
  useStockAlerts();

  const filteredNavigation = React.useMemo(() => {
    return filterNavigation(NAVIGATION); // optionally pass user roles
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar navigation={filteredNavigation} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
