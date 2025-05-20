import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  Container,
  Alert,
  Divider,
  Paper,
  Rating,
  Skeleton,
  Fade,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Snackbar
} from "@mui/material";
import { useParams, Link , useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axiosConfig";
import Loading from "../../components/Loading";
import { useCart } from "../../contexts/CartContext";
import CartSummaryBar from "../../components/CartSummaryBar";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';

const MenuPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { addToCart } = useCart();
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.user;
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [business, setBusiness] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  // Fetch business details
  const fetchBusiness = useCallback(async () => {
    setError(null);
    try {
      const response = await api.get(`api/v1/businesses/${id}`);
      setBusiness(response.data.data || null);
    } catch (err) {
      console.error("Error fetching business:", err);
      setError(
        `Failed to fetch business details: ${err.response?.data?.message || err.message || "Please try again."}`
      );
    }
  }, [id]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setError(null);
    try {
      const response = await api.get(`api/v1/categories?businessId=${id}`);
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        `Failed to fetch categories: ${err.response?.data?.message || err.message || "Please try again."}`
      );
    }
  }, [id]);

  // Fetch menu items
  const fetchItems = useCallback(async () => {
    setError(null);
    try {
      const response = await api.get(`api/v1/items?businessId=${id}`);
      setItems(response.data.data || []);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(
        `Failed to fetch menu items: ${err.response?.data?.message || err.message || "Please try again."}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const fetchAllData = async () => {
        await Promise.all([fetchBusiness(), fetchCategories(), fetchItems()]);
      };
      fetchAllData();
    }
  }, [id, fetchBusiness, fetchCategories, fetchItems]);

  const filteredItems = selectedCategory && items.data
    ? items.data.filter((item) => item.categoryId._id === selectedCategory)
    : items.data;

  const handleAddToCart = (item) => {
    addToCart(item);
    setSnackbarMessage(`${item.name} added to cart!`);
    setSnackbarOpen(true);
  };

  const toggleFavorite = (itemId) => {
    setFavorites(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', mb: 8 }}>
          <Skeleton variant="circular" width={100} height={100} sx={{ position: 'absolute', bottom: -50 }} />
        </Box>
        <Skeleton variant="text" height={60} sx={{ mt: 6, width: '60%', mx: 'auto' }} />
        <Box sx={{ display: 'flex', gap: 1, my: 3, overflowX: 'auto' }}>
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} variant="rounded" width={100} height={32} />
          ))}
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} />
              <Skeleton variant="text" height={40} sx={{ mt: 1 }} />
              <Skeleton variant="text" height={20} width="40%" />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton variant="rectangular" height={40} width="50%" />
                <Skeleton variant="rectangular" height={40} width="50%" />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Hero Section with Restaurant Image */}
      <Box sx={{ position: "relative", mb: 6 }}>
        <Box sx={{ position: "relative", height: { xs: 200, md: 300 } }}>
          <Box
            component="img"
            src={business?.image || 'https://via.placeholder.com/1200x300'}
            alt={business?.name || 'Restaurant cover'}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))',
            }}
          />
          
          {/* Back button */}
          <IconButton 
              sx={{ 
                position: 'absolute', 
                top: 16, 
                left: 16, 
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
              }}
              onClick={() => navigate(-1)} // Go back one step in history
            >
              <ArrowBackIcon />
           </IconButton>
          
          {/* Share button */}
          <IconButton 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              left: 16, 
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
            onClick={() => navigate(-1)} // Go back one step in history
          >
            <ArrowBackIcon />
          </IconButton>
          
          <IconButton 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              // Optional: Add a toast/snackbar notification
              alert('Link copied to clipboard!');
            }}
          >
            <LinkIcon /> {/* or <LinkIcon /> */}
          </IconButton>
        </Box>
        
        {/* Restaurant Logo & Info */}
        <Container maxWidth="lg">
          <Paper 
            elevation={3}
            sx={{
              position: 'relative',
              mt: -6,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 3, pb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <Avatar
                src={business?.logo || 'https://via.placeholder.com/100'}
                alt={business?.name || 'Restaurant logo'}
                sx={{
                  width: 100,
                  height: 100,
                  border: '4px solid white',
                  boxShadow: 1,
                  mr: { xs: 0, sm: 3 },
                  mb: { xs: 2, sm: 0 }
                }}
              />
              
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {business?.name || 'Restaurant Name'}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <Rating value={business?.rating || 4.5} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {business?.rating || '4.5'} • {business?.reviewCount || '86'} reviews
                  </Typography>
                </Box>
                
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                  sx={{ 
                    mb: 1, 
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    justifyContent: { xs: 'center', sm: 'flex-start' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StorefrontIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {business?.cuisine || 'Italian, American'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {business?.hours || '9:00 AM - 10:00 PM'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {business?.location || '123 Main St'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
            
            <Divider />
            
            {/* Category tabs */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              p: 1.5,
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: 6,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'rgba(0,0,0,0.05)',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'rgba(0,0,0,0.15)',
                borderRadius: 3,
              },
            }}>
              <Chip
                label="All Items"
                clickable
                onClick={() => setSelectedCategory(null)}
                color={selectedCategory === null ? "primary" : "default"}
                sx={{ 
                  fontWeight: selectedCategory === null ? 'bold' : 'normal',
                  px: 1
                }}
              />
              {categories.data?.map((cat) => (
                <Chip
                  key={cat._id}
                  label={cat.name}
                  clickable
                  onClick={() => setSelectedCategory(cat._id)}
                  color={selectedCategory === cat._id ? "primary" : "default"}
                  icon={<LocalOfferIcon fontSize="small" />}
                  sx={{ 
                    fontWeight: selectedCategory === cat._id ? 'bold' : 'normal',
                    px: 1
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            {error}
          </Alert>
        )}

        {(!filteredItems || filteredItems.length === 0) ? (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            <StorefrontIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No items found
            </Typography>
            <Typography color="text.secondary">
              {selectedCategory 
                ? "No items available in this category. Please try another category."
                : "This restaurant hasn't added any items to their menu yet."}
            </Typography>
            {selectedCategory && (
              <Button 
                variant="outlined" 
                onClick={() => setSelectedCategory(null)}
                sx={{ mt: 2 }}
              >
                View All Categories
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredItems?.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Fade in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={item.image || `https://source.unsplash.com/featured/?food&${item._id}`}
                        alt={item.name}
                        sx={{ height: 200, objectFit: 'cover' }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { bgcolor: 'white' },
                        }}
                        onClick={() => toggleFavorite(item._id)}
                      >
                        {favorites[item._id] ? (
                          <FavoriteIcon color="error" />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                      
                      {item.discount && (
                        <Chip
                          label={`${item.discount}% OFF`}
                          color="error"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            fontWeight: 'bold',
                          }}
                        />
                      )}
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                      <Typography 
                        variant="h6" 
                        component={Link} 
                        to={`/item/${item._id}`}
                        sx={{ 
                          textDecoration: 'none',
                          color: 'text.primary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {item.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {item.categoryId && (
                          <Chip
                            label={item.categoryId.name}
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                              mr: 1 
                            }}
                          />
                        )}
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 1,
                          }}
                        >
                          {item.description || 'Delicious menu item'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          ${item.price.toFixed(2)}
                        </Typography>
                        
                        {item.preparationTime && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: 16 }} />
                            <Typography variant="body2" color="text.secondary">
                              {item.preparationTime} min
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => handleAddToCart(item)}
                          sx={{ 
                            borderRadius: 6,
                            py: 1,
                            boxShadow: 2,
                          }}
                        >
                          Add to Order
                        </Button>
                        
                        <Button
                          variant="outlined"
                          component={Link}
                          to={`/item/${item._id}`}
                          sx={{ 
                            borderRadius: 6,
                            minWidth: 'auto',
                            px: 2
                          }}
                        >
                          View
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      
      {/* Cart Summary Bar at Bottom */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
        <CartSummaryBar />
      </Box>
      
      {/* Snackbar notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: 'success.main',
          }
        }}
      />
    </Box>
  );
};

export default MenuPage;