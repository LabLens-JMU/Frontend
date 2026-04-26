const pool = require("../db");

const CAMERA_CONFIG = {
  "cam-1": { minComputerId: 1, maxComputerId: 30, offset: 0 },
  "cam-2": { minComputerId: 31, maxComputerId: 37, offset: 30 },
};

const toNumberOrNull = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const resolveCameraFromComputerId = (computerId, fallback = "cam-1") => {
  const normalizedFallback = normalizeCameraId(fallback);
  const id = toNumberOrNull(computerId);

  if (id == null) {
    return normalizedFallback;
  }

  // For cam-2, the camera can legitimately send local seat ids 1-7.
  // In that case, trust the requested camera instead of inferring cam-1.
  if (normalizedFallback === "cam-2" && id >= 1 && id <= 7) {
    return "cam-2";
  }

  if (id >= CAMERA_CONFIG["cam-2"].minComputerId && id <= CAMERA_CONFIG["cam-2"].maxComputerId) {
    return "cam-2";
  }

  if (id >= CAMERA_CONFIG["cam-1"].minComputerId && id <= CAMERA_CONFIG["cam-1"].maxComputerId) {
    return "cam-1";
  }

  return normalizedFallback;
};

const toCanonicalComputerId = (cameraId, computerId) => {
  const normalizedCameraId = normalizeCameraId(cameraId);
  const id = toNumberOrNull(computerId);

  if (id == null) {
    return null;
  }

  // Allow cam-2 payloads to send local seat IDs 1-7 and store canonical 31-37.
  if (normalizedCameraId === "cam-2" && id >= 1 && id <= 7) {
    return id + CAMERA_CONFIG["cam-2"].offset;
  }

  return id;
};

const toDisplayComputerId = (cameraId, computerId) => {
  const normalizedCameraId = normalizeCameraId(cameraId);
  const id = toNumberOrNull(computerId);

  if (id == null) {
    return null;
  }

  if (
    normalizedCameraId === "cam-2" &&
    id >= CAMERA_CONFIG["cam-2"].minComputerId &&
    id <= CAMERA_CONFIG["cam-2"].maxComputerId
  ) {
    return id - CAMERA_CONFIG["cam-2"].offset;
  }

  return id;
};

const formatRowForClient = (row) => {
  const cameraId = normalizeCameraId(row.camera_id);
  const rawComputerId = toNumberOrNull(row.computer_id);
  const displayComputerId = toDisplayComputerId(cameraId, rawComputerId);

  return {
    ...row,
    camera_id: cameraId,
    computer_id: displayComputerId,
    source_computer_id: rawComputerId,
  };
};

const normalizePayload = (body = {}) => {
  const rawComputerId = body.computer_id;
  const requestedCameraId = body.camera_id ?? "cam-1";
  const cameraId = resolveCameraFromComputerId(rawComputerId, requestedCameraId);
  const computerId = toCanonicalComputerId(cameraId, rawComputerId);
  const timestamp = body.ts_ms ?? Date.now();

  return {
    camera_id: cameraId,
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

    if (computer_id == null) {
      return res.status(400).json({ error: "computer_id is required" });
    }

    const [insertResult] = await pool.query(
      `INSERT INTO occupancy 
            (camera_id, computer_id, ts_ms, occupied, confidence)
            VALUES (?, ?, ?, ?, ?)`,
      [normalizeCameraId(camera_id), computer_id, ts_ms, occupied, confidence],
    );

    const newData = {
      insert_id: insertResult.insertId ?? null,
      camera_id: normalizeCameraId(camera_id),
      computer_id: toDisplayComputerId(camera_id, computer_id),
      source_computer_id: computer_id,
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
    const displayComputerId = toDisplayComputerId(payload.camera_id, payload.computer_id);

    res.json({
      source: "mock",
      ...payload,
      camera_id: normalizeCameraId(payload.camera_id),
      computer_id: displayComputerId,
      source_computer_id: payload.computer_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET data for frontend
exports.getData = async (req, res) => {
  try {
    const sinceTs = Number(req.query.since_ts);
    let rows;

    if (Number.isFinite(sinceTs)) {
      const [historyRows] = await pool.query(
        `SELECT *
           FROM occupancy
          WHERE ts_ms >= ?
         UNION ALL
         SELECT o.*
           FROM occupancy o
           JOIN (
             SELECT lower(camera_id) AS camera_id, computer_id, MAX(ts_ms) AS max_ts
               FROM occupancy
              WHERE ts_ms < ?
              GROUP BY lower(camera_id), computer_id
           ) seed
             ON lower(o.camera_id) = seed.camera_id
            AND o.computer_id = seed.computer_id
            AND o.ts_ms = seed.max_ts
         ORDER BY ts_ms ASC`,
        [sinceTs, sinceTs],
      );

      rows = historyRows;
    } else {
      const [recentRows] = await pool.query(
        "SELECT * FROM occupancy ORDER BY ts_ms DESC LIMIT 50",
      );

      rows = recentRows;
    }

    res.json(rows.map(formatRowForClient));
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

    return res.json(rows.map(formatRowForClient));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
