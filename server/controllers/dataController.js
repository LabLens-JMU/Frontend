const pool = require("../db");

// POST data from camera system
exports.receiveData = async (req, res) => {
  try {
    const { camera_id, station_id, ts_ms, occupied, confidence } = req.body;

    const result = await pool.query(
      `INSERT INTO occupancy 
            (camera_id, station_id, ts_ms, occupied, confidence)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [camera_id, station_id, ts_ms, occupied, confidence],
    );

    const newData = result.rows[0];

    // Broadcast the new reading immediately so connected dashboards update in real time.
    const io = req.app.get("io");
    io.emit("new_data", newData);

    res.json(newData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET data for frontend
exports.getData = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM occupancy ORDER BY ts_ms DESC LIMIT 50",
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
