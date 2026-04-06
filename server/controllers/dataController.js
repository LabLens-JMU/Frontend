const pool = require("../db");

const normalizePayload = (body = {}) => {
  const stationId = Number(body.station_id ?? body.computer_id);
  const timestamp = Number(body.ts_ms ?? Date.now());

  return {
    camera_id: body.camera_id ?? "cam-1",
    station_id: stationId,
    ts_ms: Number.isFinite(timestamp) ? timestamp : Date.now(),
    occupied: body.occupied,
    confidence: body.confidence ?? null,
  };
};

// POST /api/occupancy/event
exports.receiveData = async (req, res) => {
  try {
    const { camera_id, station_id, ts_ms, occupied, confidence } =
      normalizePayload(req.body);

    if (!Number.isFinite(station_id)) {
      return res.status(400).json({ error: "station_id/computer_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO occupancy
        (camera_id, station_id, ts_ms, occupied, confidence)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [camera_id, station_id, ts_ms, occupied, confidence],
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/occupancy/current?camera_id=cam-1
exports.getCurrent = async (req, res) => {
  try {
    const cameraId = req.query.camera_id;
    if (!cameraId) {
      return res.status(400).json({ error: "camera_id query parameter is required" });
    }

    const result = await pool.query(
      `SELECT DISTINCT ON (station_id)
          camera_id,
          station_id AS computer_id,
          station_id,
          ts_ms,
          occupied,
          confidence
       FROM occupancy
       WHERE camera_id = $1
       ORDER BY station_id, ts_ms DESC`,
      [cameraId],
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Legacy endpoint for local diagnostics
exports.getData = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM occupancy ORDER BY ts_ms DESC LIMIT 50",
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
