import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";

const CartSummaryBar = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) return null; // If cart is empty, hide the bar

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTop: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 2,
        zIndex: 1000,
      }}
    >
      <Box>
        {cartItems.length} item{cartItems.length > 1 && "s"} - $
        {totalPrice.toFixed(2)}
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/cart")}
      >
        View Cart
      </Button>
    </Box>
  );
};

export default CartSummaryBar;
