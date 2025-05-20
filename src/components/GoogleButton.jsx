import { useState } from "react";
import { auth, provider, signInWithPopup } from "../firebase";
import { signInSuccess } from "../app/user/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import api from "../api/axiosConfig";

const GoogleButton = () => {
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const response = await api.post("/v1/auth/google", {
        username: result.user.displayName,
        email: result.user.email,
      });
      const data = response.data;
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      setError(error.message || "Fail to continue with google account.");
    }
  };
  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<GoogleIcon />}
      sx={{ mt: 1 }}
      onClick={handleGoogleLogin}
    >
      Login with Google
    </Button>
  );
};

export default GoogleButton;
