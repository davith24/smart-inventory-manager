import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Container,
} from "@mui/material";

 const ForgotPassword = () => {
  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 8,
        boxShadow: 3,
        p: 4,
        borderRadius: 2,
        backgroundColor: "white",
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Forgot Password
      </Typography>
      <Typography variant="body2" color="textSecondary" textAlign="center">
        Lost your password? Please enter your username or email address. You
        will receive a link to create a new password via email.
      </Typography>
      <Box
        component="form"
        noValidate
        sx={{
          mt: 2,
          width: "100%",
        }}
      >
        <TextField
          required
          fullWidth
          id="email"
          label="Username or email"
          name="email"
          autoComplete="email"
          variant="outlined"
          margin="normal"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2, mb: 2 }}
        >
          Reset Password
        </Button>
      </Box>
      <Typography variant="body2">
        Remembered your password?{" "}
        <Link href="/login" underline="hover">
          Sign in
        </Link>
      </Typography>
    </Container>
  );
}

export default ForgotPassword;