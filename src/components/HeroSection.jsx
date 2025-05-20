import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Stack,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExploreOutlined, KeyboardArrowDown } from '@mui/icons-material';
import img from "../assets/pour.png"
// Styled components for better organization and reusability
const HeroWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '90vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  color: '#fff',
  backgroundColor: '#000', // Fallback before image loads
}));

const ParallaxBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundImage: {img},
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transform: 'scale(1.1)', // Slightly larger for parallax effect
  transition: 'transform 0.5s ease-out',
  zIndex: 0,
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    alignItems: 'center',
    textAlign: 'center',
  },
}));

const HeroButton = styled(Button)(({ theme }) => ({
  borderRadius: 30,
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 8px 20px rgba(162, 131, 220, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 25px rgba(162, 131, 220, 0.5)',
  },
}));

const ScrollIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 30,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 2,
  cursor: 'pointer',
  transition: 'opacity 0.3s ease',
  '&:hover': {
    opacity: 0.8,
  },
}));

// Animation for scroll indicator
const floatAnimation = {
  '@keyframes float': {
    '0%': {
      transform: 'translateY(0px)',
    },
    '50%': {
      transform: 'translateY(-8px)',
    },
    '100%': {
      transform: 'translateY(0px)',
    },
  },
};

const HeroSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrollOffset(offset);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Animation entrance delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleExploreClick = () => {
    console.log("Explore button clicked!");
    // Navigate to destinations or show modal
    // navigate('/destinations');
  };

  const handleScrollDown = () => {
    // Scroll down to next section smoothly
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <HeroWrapper>
      {/* Parallax Background with scroll effect */}
      <ParallaxBackground 
        sx={{ 
          transform: `scale(1.1) translateY(${scrollOffset * 0.2}px)`,
          opacity: 0.9 - (scrollOffset * 0.001) // Fade slightly on scroll
        }} 
      />
      
      {/* Dark gradient overlay with improved color depth */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)',
          zIndex: 1,
        }}
      />
      
      {/* Content */}
      <ContentWrapper maxWidth="lg">
        <Fade in={isVisible} timeout={1000}>
          <Stack spacing={3} maxWidth="md">
            <Typography
              variant="overline"
              sx={{
                color: 'primary.light',
                fontWeight: 500,
                letterSpacing: 4,
                mb: -1,
                opacity: 0.9,
                fontSize: { xs: '0.8rem', sm: '0.9rem' }
              }}
            >
              DISCOVER THE WORLD
            </Typography>
            
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                lineHeight: 1.1,
                letterSpacing: -1,
                background: 'linear-gradient(90deg, #ffffff 0%, #a283dc 100%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 5px 15px rgba(0,0,0,0.3)',
                mb: 2
              }}
            >
              Travel Without Limits
            </Typography>
            
            <Typography
              variant="h5"
              component="p"
              sx={{
                fontWeight: 400,
                fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
                lineHeight: 1.5,
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: '90%',
                mb: 4
              }}
            >
              Create lifetime memories in unforgettable locations around the world.
              Explore breathtaking destinations with extraordinary experiences.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <HeroButton
                variant="contained"
                color="primary"
                startIcon={<ExploreOutlined />}
                onClick={handleExploreClick}
                sx={{
                  bgcolor: '#a283dc',
                  '&:hover': {
                    bgcolor: '#8e70c7',
                  },
                }}
              >
                Explore Destinations
              </HeroButton>
              
              <HeroButton
                variant="outlined"
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: '#fff',
                  '&:hover': {
                    borderColor: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                View Packages
              </HeroButton>
            </Box>
            
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' },
                mt: 6,
                alignItems: 'center',
                gap: 3
              }}
            >
              <Box 
                sx={{
                  width: 50,
                  height: 3,
                  bgcolor: 'primary.main',
                  borderRadius: 3
                }}
              />
              <Typography 
                variant="body2"
                sx={{ fontWeight: 500, opacity: 0.7 }}
              >
                Over 1000+ destinations worldwide
              </Typography>
            </Box>
          </Stack>
        </Fade>
      </ContentWrapper>
      
      {/* Scroll indicator */}
      <ScrollIndicator 
        onClick={handleScrollDown}
        sx={{
          animation: 'float 2s ease-in-out infinite',
          ...floatAnimation
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            mb: 1, 
            fontWeight: 500,
            letterSpacing: 1,
            opacity: 0.7 
          }}
        >
          SCROLL DOWN
        </Typography>
        <KeyboardArrowDown 
          sx={{ 
            fontSize: 30,
            color: 'primary.light',
          }} 
        />
      </ScrollIndicator>
    </HeroWrapper>
  );
};

export default HeroSection;