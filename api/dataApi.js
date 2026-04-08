const API_BASE =
  import.meta.env.VITE_OCCUPANCY_API_BASE ??
  "http://138.197.83.151/api/occupancy";

export const fetchData = async () => {
  // Pull recent occupancy history.
  const res = await fetch(`${API_BASE}/events`);
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
