import React from "react";
import { 
  Paper, 
  Box, 
  Typography, 
  IconButton, 
  Tooltip, 
  Chip,
  Divider,
  Stack,
  alpha
} from "@mui/material";
import { 
  Edit, 
  DeleteOutlined, 
  LocationOn, 
  ArrowForward 
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const BusinessCard = ({
  id,
  name,
  description,
  location,
  photo,
  logo,
  companyName,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/menu/${id}`);
  };
  
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(id);
  };
  
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        width: 320,
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 8,
          "& .card-actions": {
            opacity: 1,
          },
          "& .card-view-more": {
            opacity: 1,
          }
        },
      }}
      onClick={handleCardClick}
    >
      {/* Action Buttons */}
      <Box
        className="card-actions"
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
          opacity: 0,
          transition: "opacity 0.3s ease",
          display: "flex",
          gap: 1,
        }}
      >
        <Tooltip title="Edit">
          <IconButton
            onClick={handleEditClick}
            size="small"
            sx={{ 
              backgroundColor: "white", 
              boxShadow: 2,
              "&:hover": { 
                backgroundColor: alpha("#fff", 0.9),
              }
            }}
          >
            <Edit fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            onClick={handleDeleteClick}
            size="small"
            sx={{ 
              backgroundColor: "white", 
              boxShadow: 2,
              "&:hover": { 
                backgroundColor: alpha("#fff", 0.9),
              }
            }}
          >
            <DeleteOutlined fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Header Image */}
      <Box sx={{ position: "relative", height: 160 }}>
        <Box
          component="img"
          src={photo}
          alt={companyName}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        
        {/* Logo - Made bigger */}
        <Box
          sx={{
            position: "absolute",
            bottom: -32,  // Increased from -24 to accommodate larger logo
            left: 24,
            width: 80,    // Increased from 56
            height: 80,   // Increased from 56
            borderRadius: "50%",
            border: "3px solid white",
            backgroundColor: "white",
            boxShadow: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              p: 0.5,     // Added some padding to prevent logo from touching edges
            }}
          />
        </Box>
        
        {/* View indicator */}
        <Box 
          className="card-view-more"
          sx={{
            position: "absolute",
            bottom: 12,
            right: 12,
            opacity: 0,
            transition: "opacity 0.3s ease",
            backgroundColor: alpha("#000", 0.6),
            color: "white",
            px: 1.5,
            py: 0.5,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Typography variant="caption" fontWeight={500}>
            View Menu
          </Typography>
          <ArrowForward fontSize="small" sx={{ fontSize: 14 }} />
        </Box>
      </Box>

      {/* Content - Adjusted padding-top to accommodate larger logo */}
      <Box sx={{ p: 3, pt: 5 }}>  {/* Increased pt from 4 to 5 */}
        <Typography 
          variant="h6" 
          fontWeight={600} 
          color="primary.main"
          sx={{ mb: 0.5 }}
        >
          {companyName}
        </Typography>
        
        <Typography 
          variant="subtitle2" 
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {name}
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Typography 
          variant="body2" 
          color="text.primary"
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            lineHeight: 1.5,
            height: 48,
          }}
        >
          {description}
        </Typography>
        
        <Stack 
          direction="row" 
          spacing={1} 
          alignItems="center"
        >
          <LocationOn 
            color="action" 
            sx={{ fontSize: 16 }} 
          />
          <Typography 
            variant="caption" 
            color="text.secondary"
            fontWeight={500}
          >
            {location}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};

export default BusinessCard;