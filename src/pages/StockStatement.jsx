import { useCallback, useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  CircularProgress,
  IconButton,
  Alert,
  Tooltip,
  Avatar,
  Chip,
  MenuItem,
  Select,
  InputAdornment,
  FormControl,
  InputLabel,
  Divider,
  Stack,
} from "@mui/material";
import api from "../api/axiosConfig";
import { ArrowDownward, ArrowUpward, Inventory } from "@mui/icons-material";
import { formatMoney } from "../components/Format";
import { CheckCircle, Plus } from "lucide-react";
const StockStatement = () => {
  const [stockStatements, setStockStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchStockStatements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("api/v1/stocks");
      setStockStatements(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch stockStatements:", error);
      setNotification({
        open: true,
        message: `Failed to fetch stockStatements: ${error.message || "Unknown error"}`,
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

  // Stock indicator component with improved styling
  const StockActivityCard = ({ activity }) => {
    const isStockIn = activity.type === "stock in";

    return (
      <Card
        className="mb-4 p-4 border border-gray-200 shadow-md"
        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
      >
        <div className="flex items-center justify-between">
          <Typography variant="subtitle2" color="text.secondary">
            {new Date(activity.createdAt).toLocaleString()}
          </Typography>
          <Chip
            size="small"
            label={activity.type.toUpperCase()}
            color={isStockIn ? "success" : "error"}
            icon={isStockIn ? <ArrowDownward /> : <ArrowUpward />}
          />
        </div>
        <Typography variant="h6" className="font-bold">
          {activity.productId?.name || "Unknown Product"}
        </Typography>
        <Typography variant="body2">
          Quantity: <strong>{activity.quantity}</strong>
        </Typography>
        {activity.note && (
          <Typography variant="body2" color="text.secondary">
            Note: {activity.note}
          </Typography>
        )}
      </Card>
    );
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-600 flex items-center gap-2">
            Stock Statement
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <CircularProgress />
          </div>
        ) : stockStatements.total === 0 ? (
          <Typography color="text.secondary">
            No stock activities found.
          </Typography>
        ) : (
          <div className="flex flex-col gap-4">
            {stockStatements?.data?.map((activity) => (
              <StockActivityCard key={activity._id} activity={activity} />
            ))}
          </div>
        )}
      </Box>
    </MainLayout>
  );
};

export default StockStatement;
