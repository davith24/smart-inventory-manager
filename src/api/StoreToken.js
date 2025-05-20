import { useEffect } from "react";
import { useSelector } from "react-redux";

const StoreToken = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.token;

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  return null;
};

export default StoreToken;
