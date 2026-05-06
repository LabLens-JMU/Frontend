const DEFAULT_API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:3001/api/occupancy"
    : "https://lab-lens.site/api/occupancy";

const API_BASE = (
  import.meta.env.VITE_OCCUPANCY_API_BASE ?? DEFAULT_API_BASE
).replace(/\/+$/, "");

export const fetchData = async ({ sinceTs } = {}) => {
  const query = new URLSearchParams();
  if (sinceTs != null) {
    query.set("since_ts", String(sinceTs));
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const res = await fetch(`${API_BASE}/events${suffix}`);
  return res.json();
};

export const fetchCurrentOccupancy = async (cameraId) => {
  const encodedCameraId = encodeURIComponent(cameraId);
  const res = await fetch(
    `${API_BASE}/current?camera_id=${encodedCameraId}`,
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch current occupancy for ${cameraId}`);
  }

  return res.json();
};
