export const fetchData = async () => {
  // Pull recent occupancy history.
  const res = await fetch("http://localhost:5000/api/data");
  return res.json();
};

export const fetchCurrentOccupancy = async (cameraId) => {
  const encodedCameraId = encodeURIComponent(cameraId);
  const res = await fetch(
    `http://localhost:5000/api/occupancy/current?camera_id=${encodedCameraId}`,
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch current occupancy for ${cameraId}`);
  }

  return res.json();
};
