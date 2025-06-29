import { io } from "socket.io-client";

const socket = io("http://localhost:3000");
// const socket = io("https://smart-inventory-manager-api.onrender.com");

socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
});

export default socket;
