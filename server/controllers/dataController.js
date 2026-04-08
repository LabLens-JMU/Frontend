const pool = require("../db");

const normalizePayload = (body = {}) => {
  const computerId = body.computer_id ?? body.computer_id;
  const timestamp = body.ts_ms ?? Date.now();

  return {
    camera_id: body.camera_id ?? "cam-1",
    computer_id: computerId,
    ts_ms: timestamp,
    occupied: body.occupied,
    confidence: body.confidence ?? null,
  };
};

const normalizeCameraId = (cameraId) =>
  String(cameraId ?? "cam-1").trim().toLowerCase();

// POST data from camera system
exports.receiveData = async (req, res) => {
  try {
    const { camera_id, computer_id, ts_ms, occupied, confidence } =
      normalizePayload(req.body);

    const [insertResult] = await pool.query(
      `INSERT INTO occupancy 
            (camera_id, computer_id, ts_ms, occupied, confidence)
            VALUES (?, ?, ?, ?, ?)`,
      [normalizeCameraId(camera_id), computer_id, ts_ms, occupied, confidence],
    );

    const newData = {
      insert_id: insertResult.insertId ?? null,
      camera_id: normalizeCameraId(camera_id),
      computer_id,
      ts_ms,
      occupied,
      confidence,
    };

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
    res.json({
      source: "mock",
      ...payload,
      camera_id: normalizeCameraId(payload.camera_id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET data for frontend
exports.getData = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM occupancy ORDER BY ts_ms DESC LIMIT 50",
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getCurrentData = async (req, res) => {
  try {
    const cameraId = normalizeCameraId(req.query.camera_id);

    const [rows] = await pool.query(
      `SELECT o.*
         FROM occupancy o
         JOIN (
           SELECT computer_id, MAX(ts_ms) AS max_ts
             FROM occupancy
            WHERE lower(camera_id) = ?
            GROUP BY computer_id
         ) latest
           ON latest.computer_id = o.computer_id
          AND latest.max_ts = o.ts_ms
        WHERE lower(o.camera_id) = ?
        ORDER BY o.computer_id ASC`,
      [cameraId, cameraId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No occupancy data found for camera" });
    }

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
