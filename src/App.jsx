import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import "/css/styles.css";
import Aside from "./components/Aside";
import Header from "./components/Header";
import Card from "./components/Card";
import LayoutTwoZero from "./pages/2020-layout";
import LayoutThreeNine from "./pages/2039-layout.jsx";
import Graph from "./pages/Graph";
import socket from "../api/socket";
import { fetchData } from "../api/dataApi";

// Normalize camera/room IDs so both API payloads and UI room keys match reliably.
const normalizeRoomKey = (cameraId) => {
  if (cameraId === null || cameraId === undefined) {
    return "default";
  }

  return String(cameraId).trim().toLowerCase();
};

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

const IDLE_TIMEOUT_MS = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS ?? 15 * 60 * 1000);

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

    // Apply one reading (initial fetch or live socket push) into local seat state.
    const applyReading = (reading) => {
      const stationId = Number(reading?.station_id ?? reading?.computer_id);
      if (!Number.isFinite(stationId)) {
        return;
      }

      const roomKey = normalizeRoomKey(reading?.camera_id);
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

    // Seed the page with the latest known occupancy before live events arrive.
    const hydrateInitialData = async () => {
      try {
        const rows = await fetchData();

        // API is newest-first. Apply oldest-first so latest reading wins.
        [...rows].reverse().forEach(applyReading);
      } catch (error) {
        console.error("Failed to fetch occupancy data", error);
      }
    };

    hydrateInitialData();
    // Listen for new inserts broadcast by the backend controller.
    socket.on("new_data", applyReading);

    return () => {
      socket.off("new_data", applyReading);
      Object.values(idleTimersRef.current).forEach(clearTimeout);
      idleTimersRef.current = {};
    };
  }, []);

  // Resolve which room payload should be displayed for the currently selected room.
  const selectedRoomSeats = useMemo(() => {
    if (!activeRoom) {
      return {};
    }

    const roomToken = activeRoom.replace(/^r/i, "").toLowerCase();
    // Support a few likely camera_id formats without forcing backend changes.
    const candidateKeys = [
      activeRoom.toLowerCase(),
      roomToken,
      `room-${roomToken}`,
      `lab-${roomToken}`,
    ];

    for (const key of candidateKeys) {
      if (occupancyByRoom[key]) {
        return occupancyByRoom[key];
      }
    }

    const knownRooms = Object.keys(occupancyByRoom);
    // If the API currently streams one room only, map it automatically.
    if (knownRooms.length === 1) {
      return occupancyByRoom[knownRooms[0]];
    }

    return {};
  }, [activeRoom, occupancyByRoom]);

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
