import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  CardMedia,
  IconButton,
  Paper,
  Divider,
  Avatar,
  Chip,
  TextField,
  Snackbar,
  Alert,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useCart } from "../../contexts/CartContext";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import TvIcon from "@mui/icons-material/Tv";
import SendIcon from "@mui/icons-material/Send";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";

// Default image imports
import defaultProductImage from "../../assets/default-product.png";
import defaultMenuBackground from "../../assets/defaultMenuBackground.png";

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [menuFormat, setMenuFormat] = useState("pdf");
  const [menuStyle, setMenuStyle] = useState("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const menuRef = useRef(null);

  const [orderDetails, setOrderDetails] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    paymentMethod: "cash",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Calculate total price with memoization
  const totalPrice = React.useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  // Validate environment variables on component mount
  // useEffect(() => {
  //   if (
  //     !process.env.REACT_APP_TELEGRAM_BOT_TOKEN ||
  //     !process.env.REACT_APP_TELEGRAM_CHAT_ID
  //   ) {
  //     console.warn("Telegram bot token or chat ID not configured");
  //   }
  // }, []);

  const handleIncreaseQuantity = (itemId) => {
    const item = cartItems.find((item) => item._id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (itemId) => {
    const item = cartItems.find((item) => item._id === itemId);
    if (item && item.quantity > 1) {
      updateQuantity(itemId, item.quantity - 1);
    } else if (item) {
      removeFromCart(itemId);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOrderDetailsChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails((prev) => ({ ...prev, [name]: value }));
  };

  const sendToTelegramBot = async (orderData) => {
    const botToken = "8024094916:AAGbPgoaBeYlMboDf_PEDyUAprmSmBTIPIs";
    const chatId = 864122022;

    if (!botToken || !chatId) {
      throw new Error("Telegram bot configuration is missing");
    }

    const itemsList = orderData.items
      .map(
        (item) =>
          `- ${item.name} x${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`
      )
      .join("\n");

    const message =
      `📦 *NEW ORDER* 📦\n\n` +
      `👤 *Customer:* ${orderData.customer.name}\n` +
      `📱 *Phone:* ${orderData.customer.phone}\n` +
      `🏠 *Address:* ${orderData.customer.address}\n\n` +
      `🛒 *Items:*\n${itemsList}\n\n` +
      `💰 *Total:* $${orderData.total.toFixed(2)}\n` +
      `💳 *Payment Method:* ${orderData.customer.paymentMethod}\n` +
      `📝 *Notes:* ${orderData.customer.notes || "None"}\n\n` +
      `⏰ ${new Date().toLocaleString()}`;

    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      if (response.data.ok) {
        return true;
      }
      throw new Error("Telegram API response not OK");
    } catch (error) {
      console.error("Telegram API error:", error);
      throw new Error("Failed to send order to Telegram");
    }
  };

  const handleSubmitOrder = async () => {
    if (!orderDetails.name || !orderDetails.phone || !orderDetails.address) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: cartItems,
        customer: orderDetails,
        total: totalPrice,
        date: new Date().toISOString(),
      };

      await sendToTelegramBot(orderData);

      setSnackbar({
        open: true,
        message: "Order submitted successfully!",
        severity: "success",
      });

      clearCart();
      setOrderDialogOpen(false);
      setOrderDetails({
        name: "",
        phone: "",
        address: "",
        notes: "",
        paymentMethod: "cash",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to submit order. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = async () => {
    if (cartItems.length === 0) {
      setSnackbar({
        open: true,
        message: "Add items to generate a menu",
        severity: "warning",
      });
      return;
    }

    try {
      const menuElement = menuRef.current;
      const canvas = await html2canvas(menuElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("menu-for-tv-display.pdf");

      setSnackbar({
        open: true,
        message: "Menu PDF generated successfully!",
        severity: "success",
      });
      setMenuDialogOpen(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setSnackbar({
        open: true,
        message: "Failed to generate PDF",
        severity: "error",
      });
    }
  };

  const exportAsImage = async () => {
    if (cartItems.length === 0) {
      setSnackbar({
        open: true,
        message: "Add items to generate a menu",
        severity: "warning",
      });
      return;
    }

    try {
      const menuElement = menuRef.current;
      const canvas = await html2canvas(menuElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const image = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = "menu-for-tv-display.png";
      link.href = image;
      link.click();

      setSnackbar({
        open: true,
        message: "Menu image generated successfully!",
        severity: "success",
      });
      setMenuDialogOpen(false);
    } catch (error) {
      console.error("Error exporting image:", error);
      setSnackbar({
        open: true,
        message: "Failed to generate image",
        severity: "error",
      });
    }
  };

  const handleExport = () => {
    if (menuFormat === "pdf") {
      generatePDF();
    } else {
      exportAsImage();
    }
  };

  // Render cart item with memoization for better performance
  const renderCartItem = React.useCallback(
    (item, index) => (
      <React.Fragment key={item._id}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    overflow: "hidden",
                    mr: 2,
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="80"
                    image={item.image || defaultProductImage}
                    alt={item.name}
                    sx={{ objectFit: "cover", height: "100%" }}
                    onError={(e) => {
                      e.target.src = defaultProductImage;
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                    {item.name}
                  </Typography>
                  <Chip
                    label="In Stock"
                    size="small"
                    sx={{
                      height: 24,
                      backgroundColor: "success.light",
                      color: "success.dark",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid
              item
              xs={4}
              md={2}
              sx={{ textAlign: { xs: "left", md: "center" } }}
            >
              <Typography
                sx={{
                  color: "text.secondary",
                  display: { xs: "block", md: "none" },
                }}
              >
                Price:
              </Typography>
              <Typography fontWeight="medium">
                ${item.price.toFixed(2)}
              </Typography>
            </Grid>

            <Grid
              item
              xs={4}
              md={2}
              sx={{ textAlign: { xs: "left", md: "center" } }}
            >
              <Typography
                sx={{
                  color: "text.secondary",
                  display: { xs: "block", md: "none" },
                  mb: 1,
                }}
              >
                Quantity:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "flex-start", md: "center" },
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleDecreaseQuantity(item._id)}
                  disabled={item.quantity <= 1}
                  sx={{
                    p: 0.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "4px 0 0 4px",
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography
                  sx={{
                    px: 2,
                    py: 1,
                    minWidth: 36,
                    textAlign: "center",
                    borderTop: "1px solid",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {item.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleIncreaseQuantity(item._id)}
                  sx={{
                    p: 0.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "0 4px 4px 0",
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>

            <Grid
              item
              xs={4}
              md={2}
              sx={{ textAlign: { xs: "left", md: "right" } }}
            >
              <Typography
                sx={{
                  color: "text.secondary",
                  display: { xs: "block", md: "none" },
                }}
              >
                Total:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "space-between", md: "flex-end" },
                  alignItems: "center",
                }}
              >
                <Typography fontWeight="bold" color="primary.main">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
                <IconButton
                  color="error"
                  onClick={() => removeFromCart(item._id)}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
        {index < cartItems.length - 1 && <Divider />}
      </React.Fragment>
    ),
    [handleIncreaseQuantity, handleDecreaseQuantity, removeFromCart]
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(145deg, #f9f9f9 0%, #f3f3f3 100%)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.05)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            sx={{
              mr: 2,
              color: "text.primary",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.03)",
              },
            }}
            onClick={() => window.history.back()}
          >
            Continue Shopping
          </Button>
          <Typography
            variant="h4"
            fontWeight="700"
            color="primary"
            sx={{ flexGrow: 1 }}
          >
            Your Cart
          </Typography>
          <Badge badgeContent={cartItems.length} color="primary" sx={{ mr: 1 }}>
            <ShoppingCartIcon color="primary" />
          </Badge>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<TvIcon />}
            onClick={() => setMenuDialogOpen(true)}
            sx={{ mr: 2 }}
            disabled={cartItems.length === 0}
          >
            Generate TV Menu
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {cartItems.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                backgroundColor: "rgba(25, 118, 210, 0.1)",
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </Avatar>
            <Typography variant="h5" color="text.secondary">
              Your cart is empty
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => window.history.back()}
              sx={{ mt: 2 }}
            >
              Start Shopping
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: { xs: "none", md: "flex" }, mb: 2, px: 2 }}>
              <Grid container>
                <Grid item md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Product
                  </Typography>
                </Grid>
                <Grid item md={2} sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Price
                  </Typography>
                </Grid>
                <Grid item md={2} sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Quantity
                  </Typography>
                </Grid>
                <Grid item md={2} sx={{ textAlign: "right" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Paper
              elevation={0}
              sx={{
                mb: 4,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {cartItems.map((item, index) => renderCartItem(item, index))}
            </Paper>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                gap: 4,
                mt: 4,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Shipping Information
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Free shipping on orders over $50
                  </Typography>
                </Box>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                  border: "1px solid",
                  borderColor: "primary.light",
                  width: { xs: "100%", md: "320px" },
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Order Summary
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography fontWeight="medium">
                    ${totalPrice.toFixed(2)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography color="text.secondary">Shipping</Typography>
                  <Typography fontWeight="medium">Free</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Total
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    ${totalPrice.toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<SendIcon />}
                  onClick={() => setOrderDialogOpen(true)}
                  disabled={cartItems.length === 0}
                  sx={{
                    mb: 2,
                    py: 1.5,
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                    },
                  }}
                >
                  Place Order
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={clearCart}
                  disabled={cartItems.length === 0}
                  sx={{ fontWeight: "medium" }}
                >
                  Clear Cart
                </Button>
              </Paper>
            </Box>
          </>
        )}
      </Paper>

      {/* Order Submission Dialog */}
      <Dialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Your Order</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="Full Name *"
              name="name"
              value={orderDetails.name}
              onChange={handleOrderDetailsChange}
              error={!orderDetails.name}
              helperText={!orderDetails.name ? "Required field" : ""}
            />

            <TextField
              fullWidth
              label="Phone Number *"
              name="phone"
              value={orderDetails.phone}
              onChange={handleOrderDetailsChange}
              error={!orderDetails.phone}
              helperText={!orderDetails.phone ? "Required field" : ""}
            />

            <TextField
              fullWidth
              label="Delivery Address *"
              name="address"
              value={orderDetails.address}
              onChange={handleOrderDetailsChange}
              multiline
              rows={3}
              error={!orderDetails.address}
              helperText={!orderDetails.address ? "Required field" : ""}
            />

            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="paymentMethod"
                value={orderDetails.paymentMethod}
                onChange={handleOrderDetailsChange}
                label="Payment Method"
              >
                <MenuItem value="cash">Cash on Delivery</MenuItem>
                <MenuItem value="card">Credit Card</MenuItem>
                <MenuItem value="online">Online Payment</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Order Notes"
              name="notes"
              value={orderDetails.notes}
              onChange={handleOrderDetailsChange}
              multiline
              rows={2}
              placeholder="Special instructions, allergies, etc."
            />

            <Box
              sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Order Summary
              </Typography>
              {cartItems.map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">
                    {item.name} x{item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="subtitle1">Total</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  ${totalPrice.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOrderDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitOrder}
            disabled={
              isSubmitting ||
              !orderDetails.name ||
              !orderDetails.phone ||
              !orderDetails.address
            }
            startIcon={<SendIcon />}
          >
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu Generation Dialog */}
      <Dialog
        open={menuDialogOpen}
        onClose={() => setMenuDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Generate TV Menu Display</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <FormControl fullWidth sx={{ mb: { xs: 2, sm: 0 } }}>
              <InputLabel id="menu-format-label">Format</InputLabel>
              <Select
                labelId="menu-format-label"
                value={menuFormat}
                label="Format"
                onChange={(e) => setMenuFormat(e.target.value)}
              >
                <MenuItem value="pdf">PDF Document</MenuItem>
                <MenuItem value="image">PNG Image</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="menu-style-label">Style</InputLabel>
              <Select
                labelId="menu-style-label"
                value={menuStyle}
                label="Style"
                onChange={(e) => setMenuStyle(e.target.value)}
              >
                <MenuItem value="standard">Standard Menu</MenuItem>
                <MenuItem value="elegant">Elegant Design</MenuItem>
                <MenuItem value="modern">Modern Layout</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Preview area */}
          <Box
            sx={{
              mt: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              ref={menuRef}
              sx={{
                p: 4,
                backgroundColor:
                  menuStyle === "elegant"
                    ? "#f9f5f0"
                    : menuStyle === "modern"
                      ? "#f0f6ff"
                      : "#ffffff",
                backgroundImage:
                  menuStyle === "elegant"
                    ? `url(${defaultMenuBackground})`
                    : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  mb: 4,
                  borderBottom:
                    menuStyle === "elegant"
                      ? "2px solid #d4af37"
                      : menuStyle === "modern"
                        ? "none"
                        : "1px solid #ddd",
                  pb: 2,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    color:
                      menuStyle === "elegant"
                        ? "#8B4513"
                        : menuStyle === "modern"
                          ? "#1565c0"
                          : "primary.main",
                    fontFamily: menuStyle === "elegant" ? "serif" : "inherit",
                    textShadow:
                      menuStyle === "elegant"
                        ? "1px 1px 2px rgba(0,0,0,0.3)"
                        : "none",
                  }}
                >
                  Today's Menu
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
              </Box>

              {menuStyle === "modern" && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 4,
                  }}
                >
                  <Chip
                    label="Today's Special"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  />
                  <Chip label="Featured Items" color="secondary" />
                </Box>
              )}

              <Grid container spacing={menuStyle === "modern" ? 3 : 2}>
                {cartItems.map((item) => (
                  <Grid item xs={12} key={item._id}>
                    <Box
                      sx={{
                        display: "flex",
                        p: menuStyle === "modern" ? 2 : 1,
                        backgroundColor:
                          menuStyle === "modern"
                            ? "rgba(0,0,0,0.02)"
                            : "transparent",
                        borderRadius: menuStyle === "modern" ? 2 : 0,
                        mb: 1,
                        boxShadow:
                          menuStyle === "modern"
                            ? "0 2px 8px rgba(0,0,0,0.05)"
                            : "none",
                        borderBottom:
                          menuStyle === "elegant"
                            ? "1px dotted #d4af37"
                            : menuStyle === "modern"
                              ? "none"
                              : "1px solid #eee",
                      }}
                    >
                      {(menuStyle === "modern" || menuStyle === "standard") && (
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: menuStyle === "modern" ? 2 : 1,
                            overflow: "hidden",
                            mr: 2,
                            flexShrink: 0,
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="60"
                            image={item.image || defaultProductImage}
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = defaultProductImage;
                            }}
                          />
                        </Box>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: "bold",
                              color:
                                menuStyle === "elegant"
                                  ? "#8B4513"
                                  : menuStyle === "modern"
                                    ? "#1565c0"
                                    : "text.primary",
                              fontFamily:
                                menuStyle === "elegant" ? "serif" : "inherit",
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: "bold",
                              color:
                                menuStyle === "elegant"
                                  ? "#8B4513"
                                  : menuStyle === "modern"
                                    ? "#1565c0"
                                    : "primary.main",
                            }}
                          >
                            ${item.price.toFixed(2)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {item.description || "Delicious item from our menu"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    color:
                      menuStyle === "elegant"
                        ? "#8B4513"
                        : menuStyle === "modern"
                          ? "#1565c0"
                          : "primary.main",
                    mb: 1,
                  }}
                >
                  Enjoy Your Meal!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All prices include taxes • Menu items subject to availability
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMenuDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={
              menuFormat === "pdf" ? <PictureAsPdfIcon /> : <ImageIcon />
            }
            onClick={handleExport}
          >
            Export as {menuFormat === "pdf" ? "PDF" : "Image"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default React.memo(CartPage);
