import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
  Container,
  IconButton,
  CircularProgress,
  Stack,
  Paper,
  Fade,
  Skeleton,
  Tooltip,
  Rating,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  ShoppingCart,
  FavoriteBorder,
  Favorite,
  ArrowBack,
  Info,
  LocalOffer,
  Store,
  Category
} from "@mui/icons-material";
import api from "../../api/axiosConfig";
import { useCart } from "../../contexts/CartContext";
import CartSummaryBar from "../../components/CartSummaryBar";

const ItemDetailPage = () => {
  const { addToCart } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await api.get(`api/v1/items/${id}`);
        const itemData = response.data.data;
        setItem(itemData);
        setError(null);
      } catch (err) {
        console.error("Error fetching item:", err);
        setError("Failed to load item details");
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchItem();
    }
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!item || item.status !== "active") return;
    
    setAddingToCart(true);
    addToCart(item);
    
    // Show visual feedback for cart addition
    setTimeout(() => {
      setAddingToCart(false);
    }, 800);
  };

  const goBack = () => {
    navigate(-1);
  };

  // Determine status display
  const getStatusDisplay = (status) => {
    const statusMap = {
      active: { text: "In Stock", color: "success" },
      inactive: { text: "Out of Stock", color: "error" },
      discontinued: { text: "Discontinued", color: "warning" },
      preorder: { text: "Pre-Order", color: "info" },
    };
    return statusMap[status?.toLowerCase()] || { text: "Unknown", color: "default" };
  };

  // Loading state UI
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBack />} sx={{ mb: 3 }} onClick={goBack}>
          Back to products
        </Button>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} width="80%" sx={{ mb: 1 }} />
            <Skeleton variant="text" height={40} width="30%" sx={{ mb: 2 }} />
            <Skeleton variant="text" height={30} width="20%" sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={100} sx={{ mb: 3 }} />
            <Skeleton variant="text" height={30} width="60%" sx={{ mb: 2 }} />
            <Skeleton variant="text" height={30} width="40%" sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={50} width="100%" sx={{ mt: 4 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state UI
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: theme.palette.error.light,
            color: theme.palette.error.contrastText
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            sx={{ mt: 2 }}
            onClick={goBack}
          >
            Back to products
          </Button>
        </Paper>
      </Container>
    );
  }

  // Not found state UI
  if (!item) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Item not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            sx={{ mt: 2 }}
            onClick={goBack}
          >
            Back to products
          </Button>
        </Paper>
      </Container>
    );
  }

  const statusInfo = getStatusDisplay(item.status);

  return (
    <Fade in={!loading} timeout={800}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          sx={{ 
            mb: 3, 
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateX(-4px)'
            }
          }}
          onClick={goBack}
        >
          Back to products
        </Button>

        <Card 
          elevation={2} 
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: 6
            }
          }}
        >
          <Grid container spacing={0}>
            {/* Image section */}
            <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
              <Box sx={{ position: 'relative', height: '100%', minHeight: isMobile ? 300 : 500 }}>
                {item.image ? (
                  <CardMedia
                    component="img"
                    alt={item.name}
                    image={item.image}
                    sx={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'grey.200'
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No image available
                    </Typography>
                  </Box>
                )}
                
                {/* Status indicator overlay */}
                <Chip
                  label={statusInfo.text}
                  color={statusInfo.color}
                  size="medium"
                  sx={{ 
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Grid>

            {/* Details section */}
            <Grid item xs={12} md={6}>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2
                  }}
                >
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.primary.main
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                    <IconButton
                      aria-label="add to favorites"
                      onClick={() => setIsFavorite(!isFavorite)}
                      sx={{ 
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      {isFavorite ? 
                        <Favorite color="error" /> : 
                        <FavoriteBorder />
                      }
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography 
                  variant="h5" 
                  component="div" 
                  sx={{ 
                    mb: 3,
                    fontWeight: 700,
                    color: theme.palette.text.primary
                  }}
                >
                  ${item.price?.toFixed(2) || '0.00'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                  <Rating value={4.5} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    (24 reviews)
                  </Typography>
                </Box>

                <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                  {item.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Business & Category Info */}
                <Box sx={{ mb: 3 }}>
                  {item.businessId?.name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Store fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                      <Typography variant="body2">
                        <strong>Sold by:</strong> {item.businessId.name}
                      </Typography>
                    </Box>
                  )}
                  
                  {item.categoryId?.name && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Category fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                      <Typography variant="body2">
                        <strong>Category:</strong> {item.categoryId.name}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Tags section */}
                {item.tags && item.tags.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <LocalOffer fontSize="small" /> Tags
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                      {item.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderRadius: 1,
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Additional info from meta */}
                {item.meta?.additionalInfo && (
                  <Box 
                    sx={{ 
                      mb: 3, 
                      p: 2, 
                      bgcolor: theme.palette.background.paper,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <Info fontSize="small" /> Additional Information
                    </Typography>
                    <Typography variant="body2">
                      {item.meta.additionalInfo}
                    </Typography>
                  </Box>
                )}

                {/* Add spacing to push button to bottom on larger screens */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Add to cart button */}
                  <Box sx={{ position: 'relative', height: 200 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={addingToCart ? null : <ShoppingCart />}
                    disabled={item.status !== "active" || addingToCart}
                    onClick={handleAddToCart}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    {addingToCart ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Add to Cart"
                    )}
                  </Button>
                </Box>

              </CardContent>
            </Grid>
          </Grid>
        </Card>

        {/* Product Details Section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              mb: 3,
              pb: 1,
              borderBottom: `2px solid ${theme.palette.primary.main}`
            }}
          >
            Product Details
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Specifications
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Typography variant="body2" fontWeight={500}>{item.status}</Typography>
                  </Box>
                  <Divider />
                  
                  {item.businessId?.name && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Seller</Typography>
                        <Typography variant="body2" fontWeight={500}>{item.businessId.name}</Typography>
                      </Box>
                      <Divider />
                    </>
                  )}
                  
                  {item.categoryId?.name && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                      <Typography variant="body2" fontWeight={500}>{item.categoryId.name}</Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Shipping & Returns
                </Typography>
                <Typography variant="body2" paragraph>
                  Free shipping on orders over $50. Standard delivery 3-5 business days.
                </Typography>
                <Typography variant="body2">
                  Returns accepted within 30 days of purchase. Items must be unused and in original packaging.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 8, mb: 2 }}>
          <CartSummaryBar />
        </Box>
      </Container>
    </Fade>
  );
};

export default ItemDetailPage;