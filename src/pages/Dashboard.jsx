import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import api from "../api/axiosConfig";
import { List, Settings, Menu, TableCellsMerge } from "lucide-react";
import { Category } from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const QuickActionButton = ({ title, icon, to, color }) => {
  const colorClasses = {
    purple: "bg-purple-900 text-purple-600",
    green: "bg-green-900 text-green-600",
    blue: "bg-blue-900 text-blue-600",
    red: "bg-red-900 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  const colorClass = colorClasses[color] || "bg-gray-200 text-gray-600";
  return (
    <NavLink to={to} className="block no-underline">
      <div
        className={`flex items-center gap-2 px-4 py-5 text-white text-lg font-medium rounded-xl shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg ${colorClass}`}
      >
        <span className="text-2xl">{icon}</span>
        {title}
      </div>
    </NavLink>
  );
};

const StatCard = ({ title, value, icon, color, trend, nav }) => {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
  };

  const colorClass = colorClasses[color] || "bg-gray-200 text-gray-600";
  return (
    <NavLink to={nav}>
      <div className="bg-white shadow-md rounded-xl p-4 hover:-translate-y-1 hover:shadow-lg transition-transform h-full">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h2 className="text-2xl font-bold">{value}</h2>
            {trend && (
              <div className="flex items-center mt-1 text-green-500 text-sm">
                <Settings className="w-4 h-4" />
                <span className="ml-1">{trend}</span>
              </div>
            )}
          </div>
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${colorClass}`}
          >
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </div>
    </NavLink>
  );
};

const Dashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.user;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalCategories: 0,
    totalProducts: 0,
    totalSales: 0,
    totalCustomers: 0,
    recentSales: [],
    lowStockProducts: [],
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [categories, products, sales, customers] = await Promise.all([
        api.get("api/v1/categories"),
        api.get("api/v1/products"),
        api.get("api/v1/sales"),
        api.get("api/v1/customers"),
      ]);

      setDashboardData({
        totalCategories: categories.data?.data?.total || 0,
        totalProducts: products.data?.data?.total || 0,
        totalSales: sales.data?.data?.total || 0,
        totalCustomers: customers.data?.data?.total || 0,
        recentSales: sales.data?.data?.data || [],
        lowStockProducts: [],
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const [salesChartData, setSalesChartData] = useState([]);
  const [sales, setSales] = useState();

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("api/v1/sales");
      setSales(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      setNotification({
        open: true,
        message: `Failed to fetch sales: ${error.message || "Unknown error"}`,
        severity: "error",
      });
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    if (!sales) return;

    const salesList = sales?.data || [];

    const groupedSales = salesList.reduce((acc, sale) => {
      const date = new Date(sale.saleDate || sale.createdAt)
        .toISOString()
        .split("T")[0];
      acc[date] = (acc[date] || 0) + sale.totalAmount;
      return acc;
    }, {});

    const chartData = Object.entries(groupedSales).map(([date, total]) => ({
      date,
      totalAmount: total,
    }));

    setSalesChartData(chartData);
  }, [sales]);

  const [topSales, setTopSales] = useState([]);

  useEffect(() => {
    if (!sales) return;

    const salesList = sales?.data || [];

    // ✅ Grouping for chart
    const groupedSales = salesList.reduce((acc, sale) => {
      const date = new Date(sale.saleDate || sale.createdAt)
        .toISOString()
        .split("T")[0];
      acc[date] = (acc[date] || 0) + sale.totalAmount;
      return acc;
    }, {});

    const chartData = Object.entries(groupedSales).map(([date, total]) => ({
      date,
      totalAmount: total,
    }));

    setSalesChartData(chartData);

    // ✅ Top 5 sales
    const sortedSales = [...salesList].sort(
      (a, b) => b.totalAmount - a.totalAmount
    );
    const top5 = sortedSales.slice(0, 5);
    setTopSales(top5);
  }, [sales]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p>Loading</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="bg-gradient-to-r from-gray-600 to-blue-800 text-white p-6 rounded-xl mb-6">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Here's what's happening with your business today
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Categories"
            value={dashboardData.totalCategories}
            icon={<Category />}
            color="blue"
            nav="/categories-management"
          />
          <StatCard
            title="Total Products"
            value={dashboardData.totalProducts}
            icon={<Settings />}
            color="red"
            nav="/products-management"
          />
          <StatCard
            title="Total Sales"
            value={dashboardData.totalSales}
            icon={<Settings />}
            color="green"
          />
          <StatCard
            title="Total Customers"
            value={dashboardData.totalCustomers}
            icon={<Settings />}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionButton
                title="Add New Product"
                icon={<Settings />}
                to="/products-management"
                color="blue"
              />
              <QuickActionButton
                title="Record a Sale"
                icon={<Settings />}
                to="/sales-management"
                color="green"
              />
              <QuickActionButton
                title="View alerts"
                icon={<Settings />}
                to="/stock-alerts"
                color="yellow"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Top 5 Sales</h2>
            <ul className="divide-y divide-gray-200">
              {topSales.map((sale, index) => (
                <li
                  key={sale._id || index}
                  className="py-2 flex justify-between"
                >
                  <span>
                    {new Date(
                      sale.saleDate || sale.createdAt
                    ).toLocaleDateString()}
                  </span>
                  <span>#{sale._id.slice(-6).toUpperCase()}</span>
                  <span className="font-semibold text-blue-600">
                    ${sale.totalAmount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="totalAmount"
                stroke="#8884d8"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
