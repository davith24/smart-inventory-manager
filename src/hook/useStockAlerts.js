// hooks/useStockAlerts.js
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import api from "../api/axiosConfig";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000");

export const useStockAlerts = () => {
  const showToastOnce = async (product) => {
    console.log(product.isRead);
    if (
      product.currentQuantity < product.reorderLevel &&
      product.isRead === false
    ) {
      toast.warn(`${product?.productId?.name} is low on stock!`, {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
      await api.patch(`/api/v1/stock-alerts/${product?._id}/read`);
    }
  };

  useEffect(() => {
    const fetchAndCheckStock = async () => {
      try {
        const res = await api.get("/api/v1/stock-alerts");
        const products = res.data.data;
        products?.data?.forEach((product) => {
          showToastOnce(product);
        });
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };

    fetchAndCheckStock();

    socket.on("productUpdated", (product) => {
      showToastOnce(product);
    });

    return () => {
      socket.off("productUpdated");
    };
  }, []);
};
