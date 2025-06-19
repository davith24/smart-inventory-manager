import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import api from "../api/axiosConfig";
import MainLayout from "../layouts/MainLayout";
import { AlertTriangle } from "lucide-react";

const StockAlerts = () => {
  const [stockStatements, setStockStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const fetchStockStatements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("api/v1/products");
      const products = response.data.data || [];
      const lowStock = products.data.filter(
        (pro) => pro.quantity < pro.reorderLevel
      );
      console.log(lowStock);
      setStockStatements(lowStock);
    } catch (error) {
      console.error("Failed to fetch stock statements:", error);
      setNotification({
        open: true,
        message: `Failed to fetch stock alerts: ${error.message || "Unknown error"}`,
        severity: "error",
      });
      setStockStatements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockStatements();
  }, [fetchStockStatements]);

  return (
    <MainLayout>
      <Box className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-600 flex items-center gap-2">
            Stock Alerts
          </h1>
        </div>

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {notification.open && (
              <Alert severity={notification.severity} className="mb-4">
                {notification.message}
              </Alert>
            )}

            {stockStatements.length === 0 ? (
              <Alert severity="success">All stock levels are OK.</Alert>
            ) : (
              <div className="mt-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4 shadow-md space-y-4">
                {stockStatements?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-start gap-4 border-b border-yellow-200 last:border-none pb-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="bg-yellow-400 p-2 rounded-full text-white">
                        <AlertTriangle size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-800">
                        {item.name || "Unnamed Product"}
                      </h3>
                      <p className="text-sm text-yellow-700">
                        Stock: {item.quantity} | Threshold: {item.reorderLevel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Box>
    </MainLayout>
  );
};

export default StockAlerts;
