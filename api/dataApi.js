const API_BASE_URL = (
  import.meta.env.VITE_OCCUPANCY_API_BASE || "http://138.197.83.151"
).replace(/\/$/, "");

const API_KEY = import.meta.env.VITE_OCCUPANCY_API_KEY || "lablens-secret";

export const ROOM_CAMERA_MAP = {
  r2020: "cam-1",
  r2037: "cam-2",
};

const buildHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }

  return headers;
};

export const fetchCurrentOccupancy = async (cameraId) => {
  const url = new URL(`${API_BASE_URL}/api/occupancy/current`);
  url.searchParams.set("camera_id", cameraId);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: buildHeaders(),
  });

  if (!res.ok) {
    throw new Error(`GET ${url} failed with status ${res.status}`);
  }

  return res.json();
};

export const postOccupancyEvent = async (payload) => {
  const url = `${API_BASE_URL}/api/occupancy/event`;

  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`POST ${url} failed with status ${res.status}`);
  }

  return res.json();
};
