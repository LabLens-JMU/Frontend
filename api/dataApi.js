export const fetchData = async () => {
  // Pull recent occupancy history so the UI has state before socket events.
  const res = await fetch("http://localhost:5000/api/data");
  return res.json();
};
