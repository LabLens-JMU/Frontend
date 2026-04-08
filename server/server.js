const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/occupancy", require("./routes/dataRoutes"));
app.use("/api/occupancy/events", require("./routes/dataRoutes"));
app.listen(3001, () => console.log("Server running on port 3001"));
