import axios from "axios";
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

const api = axios.create({
  baseURL: "https://vd-menu-api.onrender.com",
  // baseURL: "http://localhost:2003",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
