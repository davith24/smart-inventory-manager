import React, { useState } from 'react';
import { 
  Button, 
  Box, 
  IconButton, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Badge
} from '@mui/material';
import { Add, Remove, ShoppingCart } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const AddToCart = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    onAddToCart(item, quantity);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton 
        size="small" 
        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
      >
        <Remove fontSize="small" />
      </IconButton>
      <Typography variant="body1">{quantity}</Typography>
      <IconButton 
        size="small" 
        onClick={() => setQuantity(prev => prev + 1)}
      >
        <Add fontSize="small" />
      </IconButton>
      <Button 
        variant="contained" 
        size="small"
        onClick={handleAdd}
        startIcon={<ShoppingCart />}
      >
        Add
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Item Added to Cart</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar src={item.image} alt={item.name} />
              </ListItemAvatar>
              <ListItemText 
                primary={item.name} 
                secondary={`$${item.price.toFixed(2)} x ${quantity}`}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Continue Shopping</Button>
          <Button 
            component={Link} 
            to="/cart" 
            variant="contained"
            onClick={handleClose}
          >
            View Cart
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddToCart;