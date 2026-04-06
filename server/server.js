const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/data", require("./routes/dataRoutes"));
app.use("/api/occupancy", require("./routes/dataRoutes"));
app.listen(5000, () => console.log("Server running on port 5000"));
