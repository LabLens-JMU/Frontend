const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket.IO shares the same HTTP server as Express so API and live events use one port.
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// Expose io so controllers can emit seat updates after DB writes.
app.set("io", io);

app.use("/api/data", require("./routes/dataRoutes"));
app.use("/api/occupancy", require("./routes/dataRoutes"));

// WebSocket connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
