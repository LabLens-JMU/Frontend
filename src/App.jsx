import { useEffect, useMemo, useState } from "react";
import "./App.css";
import "/css/styles.css";
import Aside from "./components/Aside";
import Header from "./components/Header";
import Card from "./components/Card";
import LayoutTwoZero from "./pages/2020-layout";
import LayoutThreeSeven from "./pages/2037-layout";
import LayoutThreeNine from "./pages/2039-layout.jsx";
import Graph from "./pages/Graph";
import { fetchCurrentOccupancy } from "../api/dataApi";

// Center payload contract: 0 = empty, 1 = idle, 2 = full.
const toSeatState = (occupied) => {
  if (occupied === 2 || occupied === "2") {
    return "full";
  }

  if (occupied === 1 || occupied === "1") {
    return "idle";
  }

  if (occupied === 0 || occupied === "0") {
    return "empty";
  }

  return "idle";
};

const POLL_INTERVAL_MS = Number(import.meta.env.VITE_OCCUPANCY_POLL_MS ?? 3000);
const CAMERA_ROOM_MAP = {
  "cam-1": "r2020",
  "cam-2": "r2037",
};

export default function App() {
  // Shape: { [roomKey]: { [stationId]: "empty" | "idle" | "full" } }
  const [occupancyByRoom, setOccupancyByRoom] = useState({});
  const [activeRoom, setActiveRoom] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    const applyReading = (reading) => {
      const stationId = Number(reading?.station_id ?? reading?.computer_id);
      if (!Number.isFinite(stationId)) {
        return;
      }

      const cameraId = String(reading?.camera_id ?? "")
        .trim()
        .toLowerCase();
      const roomKey = CAMERA_ROOM_MAP[cameraId];

      // Ignore unsupported rooms so 2039 stays a static filler room.
      if (!roomKey) {
        return;
      }

      const nextSeatState = toSeatState(reading?.occupied);

      setOccupancyByRoom((prev) => ({
        ...prev,
        [roomKey]: {
          ...(prev[roomKey] || {}),
          [stationId]: nextSeatState,
        },
      }));
    };

    const pollCurrentOccupancy = async () => {
      try {
        const [cam1Reading, cam2Reading] = await Promise.all([
          fetchCurrentOccupancy("cam-1"),
          fetchCurrentOccupancy("cam-2"),
        ]);

        if (cam1Reading) {
          applyReading(cam1Reading);
        }

        if (cam2Reading) {
          applyReading(cam2Reading);
        }
      } catch (error) {
        console.error("Failed to fetch current occupancy", error);
      }
    };

    pollCurrentOccupancy();
    const pollTimer = setInterval(pollCurrentOccupancy, POLL_INTERVAL_MS);

    return () => {
      clearInterval(pollTimer);
    };
  }, []);

  // Resolve which room payload should be displayed for the currently selected room.
  const selectedRoomSeats = useMemo(
    () => (activeRoom ? occupancyByRoom[activeRoom] ?? {} : {}),
    [activeRoom, occupancyByRoom],
  );

  const handleSelectBuilding = (building) => {
    setSelectedBuilding(building);
    setActiveRoom(null);
  };

  const handleSelectRoom = (roomId) => {
    setActiveRoom(roomId);
  };

  // Landing mode stays active until a building is selected.
  const showLandingDirectory = !selectedBuilding;
  let screenContent = null;
  let centerClassName = "center";
  let leftClassName = "left";

  // Choose what to show on the right side after the landing page.
  if (activeRoom === "r2020") {
    screenContent = <LayoutTwoZero seatStates={selectedRoomSeats} />;
  } else if (activeRoom === "r2037") {
    screenContent = <LayoutThreeSeven seatStates={selectedRoomSeats} />;
  } else if (activeRoom === "r2039") {
    screenContent = <LayoutThreeNine seatStates={selectedRoomSeats} />;
  } else if (selectedBuilding) {
    screenContent = (
      <Card rooms={selectedBuilding.rooms} onSelectRoom={handleSelectRoom} />
    );
  }

  if (showLandingDirectory) {
    centerClassName += " aside-center";
    leftClassName += " aside-left";
  }

  // Center the aside on the landing page, then switch back to the normal layout.
  let mainContent = (
    <div className={centerClassName}>
      <section className={leftClassName}>
        <Aside
          onSelectRoom={handleSelectRoom}
          onSelectBuilding={handleSelectBuilding}
          selectedBuilding={selectedBuilding}
          activeRoomId={activeRoom}
        />
      </section>
      {!showLandingDirectory && (
        <section className="screen">{screenContent}</section>
      )}
    </div>
  );

  // The graph view replaces the default layout when opened from the header.
  if (showGraph) {
    mainContent = <Graph />;
  }

  return (
    <div className="main">
      <section className="top">
        <Header onShowGraph={() => setShowGraph(true)} />
      </section>
      {mainContent}
    </div>
  );
}
