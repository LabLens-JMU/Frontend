const pool = require("../db");

const normalizePayload = (body = {}) => {
  const stationId = body.station_id ?? body.computer_id;
  const timestamp = body.ts_ms ?? Date.now();

  return {
    camera_id: body.camera_id ?? "cam-1",
    station_id: stationId,
    ts_ms: timestamp,
    occupied: body.occupied,
    confidence: body.confidence ?? null,
  };
};

// POST data from camera system
exports.receiveData = async (req, res) => {
  try {
    const { camera_id, station_id, ts_ms, occupied, confidence } =
      normalizePayload(req.body);

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

// POST mock data without touching the DB; useful for real-time UI smoke tests.
exports.receiveMockData = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    const io = req.app.get("io");
    io.emit("new_data", payload);

    res.json({ source: "mock", ...payload });
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
