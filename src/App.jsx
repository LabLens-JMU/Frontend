import { useEffect, useMemo, useRef, useState } from "react";
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

// Convert backend occupied values into the three UI seat states.
const toSeatState = (occupied) => {
  if (
    occupied === true ||
    occupied === 1 ||
    occupied === "1" ||
    occupied === "true"
  ) {
    return "full";
  }

  if (
    occupied === false ||
    occupied === 0 ||
    occupied === "0" ||
    occupied === "false"
  ) {
    return "empty";
  }

  return "idle";
};

const IDLE_TIMEOUT_MS = Number(
  import.meta.env.VITE_IDLE_TIMEOUT_MS ?? 15 * 60 * 1000,
);
const POLL_INTERVAL_MS = Number(import.meta.env.VITE_OCCUPANCY_POLL_MS ?? 3000);
const CAMERA_ROOM_MAP = {
  "cam-1": "r2020",
  "cam-2": "r2037",
};

export default function App() {
  // Shape: { [roomKey]: { [stationId]: "empty" | "idle" | "full" } }
  const [occupancyByRoom, setOccupancyByRoom] = useState({});
  const occupancyRef = useRef({});
  const lastOccupiedRef = useRef({});
  const idleTimersRef = useRef({});
  const [activeRoom, setActiveRoom] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    const clearIdleTimer = (roomKey, stationId) => {
      const timerKey = `${roomKey}:${stationId}`;
      const existingTimer = idleTimersRef.current[timerKey];
      if (existingTimer) {
        clearTimeout(existingTimer);
        delete idleTimersRef.current[timerKey];
      }
    };

    const setSeatStatus = (roomKey, stationId, status) => {
      setOccupancyByRoom((prev) => {
        const next = {
          ...prev,
          [roomKey]: {
            ...(prev[roomKey] || {}),
            [stationId]: status,
          },
        };

        occupancyRef.current = next;
        return next;
      });
    };

    const scheduleIdleToEmpty = (roomKey, stationId, tsMs) => {
      clearIdleTimer(roomKey, stationId);

      const timestamp = Number(tsMs);
      const idleUntil = Number.isFinite(timestamp)
        ? timestamp + IDLE_TIMEOUT_MS
        : Date.now() + IDLE_TIMEOUT_MS;
      const remainingMs = Math.max(0, idleUntil - Date.now());
      const timerKey = `${roomKey}:${stationId}`;

      idleTimersRef.current[timerKey] = setTimeout(() => {
        delete idleTimersRef.current[timerKey];

        const currentStatus = occupancyRef.current?.[roomKey]?.[stationId];
        const lastOccupied = lastOccupiedRef.current[timerKey];

        // Only move to empty if the seat is still idle and no newer occupied event arrived.
        if (currentStatus === "idle" && lastOccupied === false) {
          setSeatStatus(roomKey, stationId, "empty");
        }
      }, remainingMs);
    };

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
      const timerKey = `${roomKey}:${stationId}`;
      const previousOccupied = lastOccupiedRef.current[timerKey];

      if (nextSeatState === "full") {
        lastOccupiedRef.current[timerKey] = true;
        clearIdleTimer(roomKey, stationId);
        setSeatStatus(roomKey, stationId, "full");
        return;
      }

      if (nextSeatState === "empty") {
        lastOccupiedRef.current[timerKey] = false;
        const currentStatus = occupancyRef.current?.[roomKey]?.[stationId];
        const idleTimerExists = Boolean(idleTimersRef.current[timerKey]);

        // Transition rule from frontend: a 1 -> 0 first becomes idle, then empty after 15 minutes.
        if (previousOccupied === true) {
          setSeatStatus(roomKey, stationId, "idle");
          scheduleIdleToEmpty(roomKey, stationId, reading?.ts_ms);
          return;
        }

        // Keep seat idle while its cooldown timer is still active.
        if (currentStatus === "idle" && idleTimerExists) {
          return;
        }

        // 0 without a preceding 1 should remain empty.
        setSeatStatus(roomKey, stationId, "empty");
        return;
      }

      setSeatStatus(roomKey, stationId, "idle");
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
      Object.values(idleTimersRef.current).forEach(clearTimeout);
      idleTimersRef.current = {};
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
