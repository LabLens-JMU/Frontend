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
const THEME_STORAGE_KEY = "lablens-theme";
const CAMERA_ROOM_MAP = {
  "cam-1": "r2020",
  "cam-2": "r2037",
};

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return "light";
};

const normalizeCurrentPayload = (requestedCameraId, payload) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  // Supports shape: { camera_id: "cam-1", computers: [{ computer_id, occupied, ... }] }
  if (Array.isArray(payload.computers)) {
    return payload.computers.map((computer) => ({
      camera_id: payload.camera_id ?? requestedCameraId,
      ...computer,
    }));
  }

  return [payload];
};

export default function App() {
  // Shape: { [roomKey]: { [stationId]: "empty" | "idle" | "full" } }
  const [occupancyByRoom, setOccupancyByRoom] = useState({});
  const [activeRoom, setActiveRoom] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const applyReading = (roomKey, reading) => {
      const stationId = Number(reading?.computer_id ?? reading?.station_id);
      if (!Number.isFinite(stationId)) {
        return;
      }

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
        const [cam1Readings, cam2Readings] = await Promise.all([
          fetchCurrentOccupancy("cam-1"),
          fetchCurrentOccupancy("cam-2"),
        ]);

        const room2020Readings = normalizeCurrentPayload("cam-1", cam1Readings);
        const room2037Readings = normalizeCurrentPayload("cam-2", cam2Readings);

        for (const reading of room2020Readings) {
          applyReading(CAMERA_ROOM_MAP["cam-1"], reading);
        }

        for (const reading of room2037Readings) {
          applyReading(CAMERA_ROOM_MAP["cam-2"], reading);
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

  const handleBackToRooms = () => {
    setActiveRoom(null);
  };

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  // Landing mode stays active until a building is selected.
  const showLandingDirectory = !selectedBuilding;
  let screenContent = null;
  let centerClassName = "center";
  let leftClassName = "left";

  // Choose what to show on the right side after the landing page.
  if (activeRoom === "r2020") {
    screenContent = <LayoutTwoZero seatStates={selectedRoomSeats} onBack={handleBackToRooms} />;
  } else if (activeRoom === "r2037") {
    screenContent = <LayoutThreeSeven seatStates={selectedRoomSeats} onBack={handleBackToRooms} />
  } else if (activeRoom === "r2039") {
    screenContent = <LayoutThreeNine seatStates={selectedRoomSeats} onBack={handleBackToRooms} />;
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
        <Header
          onShowGraph={() => setShowGraph(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      </section>
      {mainContent}
    </div>
  );
}
