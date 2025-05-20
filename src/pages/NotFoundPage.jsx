import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <Box>
        <Typography variant="h3" color="error" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Sorry, the page you are looking for does not exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Go Back to Home
        </Button>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
  