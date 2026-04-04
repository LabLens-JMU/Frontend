import { io } from "socket.io-client";

// Single shared socket connection for live occupancy updates.
const socket = io("http://localhost:5000");

export default socket;
