import React from 'react';
import { 
  Box, 
  Typography, 
  Link, 
  Container, 
  Grid, 
  Divider, 
  Stack, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  InputBase,
  Button,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn, 
  YouTube,
  LocationOn,
  Email,
  Phone,
  Send
} from '@mui/icons-material';

// Styled components
const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' 
    ? theme.palette.grey[900] 
    : theme.palette.grey[900],
  color: theme.palette.common.white,
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'radial-gradient(circle at 50% 80%, rgba(62, 62, 62, 0.8) 0%, rgba(25, 25, 25, 0) 60%)',
    opacity: 0.4,
  }
}));

const FooterHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  position: 'relative',
  paddingBottom: theme.spacing(1),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 2,
    backgroundColor: theme.palette.primary.main,
  }
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.grey[300],
  textDecoration: 'none',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    color: theme.palette.primary.light,
    textDecoration: 'none',
  },
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: theme.palette.common.white,
  transition: 'all 0.2s ease-in-out',
  marginRight: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  },
}));

const NewsletterInput = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(4),
  padding: theme.spacing(0.5, 0.5, 0.5, 2),
  width: '100%',
  marginTop: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  '&:focus-within': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: theme.palette.primary.main,
  }
}));

const ContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(1.5),
    color: theme.palette.grey[400],
  }
}));

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentYear = new Date().getFullYear();
  
  const companyName = "Your Company";
  const companyLogo = "https://i.pinimg.com/736x/12/83/16/1283166bf58b7a77574a51cdeaa68142.jpg";
  
  const quickLinks = [
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' },
    { name: 'Services', url: '/services' },
    { name: 'Portfolio', url: '/portfolio' },
    { name: 'Contact', url: '/contact' },
  ];
  
  const policies = [
    { name: 'Privacy Policy', url: '/privacy' },
    { name: 'Terms of Service', url: '/terms' },
    { name: 'Cookie Policy', url: '/cookies' },
    { name: 'Refund Policy', url: '/refunds' },
    { name: 'FAQ', url: '/faq' },
  ];
  
  const socialLinks = [
    { name: 'Facebook', icon: <Facebook fontSize="small" />, url: 'https://facebook.com' },
    { name: 'Twitter', icon: <Twitter fontSize="small" />, url: 'https://twitter.com' },
    { name: 'Instagram', icon: <Instagram fontSize="small" />, url: 'https://instagram.com' },
    { name: 'LinkedIn', icon: <LinkedIn fontSize="small" />, url: 'https://linkedin.com' },
    { name: 'YouTube', icon: <YouTube fontSize="small" />, url: 'https://youtube.com' },
  ];
  
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter subscription submitted');
    // Add your newsletter subscription logic here
  };

  return (
    <FooterWrapper component="footer">
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Main Footer Content */}
        <Grid container spacing={4}>
          {/* Company Info Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src={companyLogo}
                alt={companyName}
                sx={{ 
                  height: 40, 
                  width: 40, 
                  mr: 1.5,
                  borderRadius: 1 
                }}
              />
              <Typography variant="h6" fontWeight={700} color="white">
                {companyName}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="grey.400" sx={{ mb: 3, maxWidth: 300 }}>
              We provide exceptional services for your business needs. Our team of experts is dedicated to delivering the best solutions tailored to your requirements.
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <FooterHeading variant="subtitle1">
                Contact Us
              </FooterHeading>
              
              <ContactItem>
                <LocationOn fontSize="small" />
                <Typography variant="body2" color="grey.400">
                  1234 Street Name, City, Country
                </Typography>
              </ContactItem>
              
              <ContactItem>
                <Email fontSize="small" />
                <FooterLink href="mailto:info@yourcompany.com">
                  info@yourcompany.com
                </FooterLink>
              </ContactItem>
              
              <ContactItem>
                <Phone fontSize="small" />
                <FooterLink href="tel:+1234567890">
                  +1 (234) 567-890
                </FooterLink>
              </ContactItem>
            </Box>
            
            <Box>
              <FooterHeading variant="subtitle1">
                Follow Us
              </FooterHeading>
              
              <Box sx={{ display: 'flex', mt: 1 }}>
                {socialLinks.map((social) => (
                  <SocialIconButton
                    key={social.name}
                    aria-label={`Follow us on ${social.name}`}
                    size="small"
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener"
                  >
                    {social.icon}
                  </SocialIconButton>
                ))}
              </Box>
            </Box>
          </Grid>
          
          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <FooterHeading variant="subtitle1">
              Quick Links
            </FooterHeading>
            
            <List disablePadding>
              {quickLinks.map((link) => (
                <ListItem key={link.name} disablePadding disableGutters sx={{ mb: 0.5 }}>
                  <FooterLink href={link.url}>
                    {link.name}
                  </FooterLink>
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* Policies */}
          <Grid item xs={12} sm={6} md={2}>
            <FooterHeading variant="subtitle1">
              Policies
            </FooterHeading>
            
            <List disablePadding>
              {policies.map((policy) => (
                <ListItem key={policy.name} disablePadding disableGutters sx={{ mb: 0.5 }}>
                  <FooterLink href={policy.url}>
                    {policy.name}
                  </FooterLink>
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <FooterHeading variant="subtitle1">
              Newsletter
            </FooterHeading>
            
            <Typography variant="body2" color="grey.400" sx={{ mb: 2 }}>
              Subscribe to our newsletter to receive updates and exclusive offers.
            </Typography>
            
            <form onSubmit={handleNewsletterSubmit}>
              <NewsletterInput elevation={0}>
                <InputBase
                  placeholder="Your email address"
                  sx={{ 
                    ml: 0, 
                    flex: 1,
                    color: 'white',
                    '& ::placeholder': { color: 'grey.400', opacity: 1 }
                  }}
                />
                <Button
                  type="submit"
                  sx={{ 
                    borderRadius: '50%',
                    p: 1,
                    minWidth: 'auto',
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    }
                  }}
                >
                  <Send fontSize="small" />
                </Button>
              </NewsletterInput>
            </form>
            
            <Typography variant="caption" color="grey.500" sx={{ mt: 2, display: 'block' }}>
              * We respect your privacy. Unsubscribe at any time.
            </Typography>
          </Grid>
        </Grid>
        
        {/* Divider */}
        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        {/* Bottom Footer */}
        <Grid 
          container 
          spacing={2} 
          justifyContent="space-between" 
          alignItems="center"
          direction={isMobile ? 'column-reverse' : 'row'}
        >
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="grey.500" align={isMobile ? 'center' : 'left'}>
              &copy; {currentYear} {companyName}. All rights reserved.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack 
              direction="row" 
              spacing={2} 
              divider={<Box component="span" sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</Box>}
              justifyContent={isMobile ? 'center' : 'flex-end'}
              sx={{ mb: isMobile ? 2 : 0 }}
            >
              <FooterLink href="#" variant="body2" color="grey.500">
                Sitemap
              </FooterLink>
              <FooterLink href="#" variant="body2" color="grey.500">
                Accessibility
              </FooterLink>
              <FooterLink href="#" variant="body2" color="grey.500">
                Legal
              </FooterLink>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;