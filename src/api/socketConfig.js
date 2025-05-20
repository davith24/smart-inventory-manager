import { io } from "socket.io-client";

const socket = io("https://vd-menu-api.onrender.com");

socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
});

export default socket;
