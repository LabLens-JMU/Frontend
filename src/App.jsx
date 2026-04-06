import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import "/css/styles.css";
import Aside from "./components/Aside";
import Header from "./components/Header";
import Card from "./components/Card";
import LayoutTwoZero from "./pages/2020-layout";
import LayoutThreeNine from "./pages/2039-layout.jsx";
import Graph from "./pages/Graph";
import { fetchCurrentOccupancy, ROOM_CAMERA_MAP } from "../api/dataApi";

const IDLE_TIMEOUT_MS = Number(
  import.meta.env.VITE_IDLE_TIMEOUT_MS ?? 15 * 60 * 1000,
);
const POLL_INTERVAL_MS = Number(import.meta.env.VITE_OCCUPANCY_POLL_MS ?? 5000);

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

const rowsFromPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.rows)) {
    return payload.rows;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

export default function App() {
  // Shape: { [roomId]: { [seatId]: "empty" | "idle" | "full" } }
  const [occupancyByRoom, setOccupancyByRoom] = useState({});
  const occupancyRef = useRef({});
  const lastOccupiedRef = useRef({});
  const idleTimersRef = useRef({});
  const [activeRoom, setActiveRoom] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    const clearIdleTimer = (roomId, seatId) => {
      const timerKey = `${roomId}:${seatId}`;
      const existingTimer = idleTimersRef.current[timerKey];
      if (existingTimer) {
        clearTimeout(existingTimer);
        delete idleTimersRef.current[timerKey];
      }
    };

    const setSeatStatus = (roomId, seatId, status) => {
      setOccupancyByRoom((prev) => {
        const next = {
          ...prev,
          [roomId]: {
            ...(prev[roomId] || {}),
            [seatId]: status,
          },
        };

        occupancyRef.current = next;
        return next;
      });
    };

    const scheduleIdleToEmpty = (roomId, seatId, tsMs) => {
      clearIdleTimer(roomId, seatId);

      const timestamp = Number(tsMs);
      const idleUntil = Number.isFinite(timestamp)
        ? timestamp + IDLE_TIMEOUT_MS
        : Date.now() + IDLE_TIMEOUT_MS;
      const remainingMs = Math.max(0, idleUntil - Date.now());
      const timerKey = `${roomId}:${seatId}`;

      idleTimersRef.current[timerKey] = setTimeout(() => {
        delete idleTimersRef.current[timerKey];

        const currentStatus = occupancyRef.current?.[roomId]?.[seatId];
        const lastOccupied = lastOccupiedRef.current[timerKey];

        if (currentStatus === "idle" && lastOccupied === false) {
          setSeatStatus(roomId, seatId, "empty");
        }
      }, remainingMs);
    };

    const applyReading = (roomId, reading) => {
      const seatId = Number(reading?.station_id ?? reading?.computer_id);
      if (!Number.isFinite(seatId)) {
        return;
      }

      const nextSeatState = toSeatState(reading?.occupied);
      const seatKey = `${roomId}:${seatId}`;
      const previousOccupied = lastOccupiedRef.current[seatKey];

      if (nextSeatState === "full") {
        lastOccupiedRef.current[seatKey] = true;
        clearIdleTimer(roomId, seatId);
        setSeatStatus(roomId, seatId, "full");
        return;
      }

      if (nextSeatState === "empty") {
        lastOccupiedRef.current[seatKey] = false;
        const currentStatus = occupancyRef.current?.[roomId]?.[seatId];
        const idleTimerExists = Boolean(idleTimersRef.current[seatKey]);

        // Frontend rule: 1 -> 0 enters idle first, then empty after the cooldown.
        if (previousOccupied === true) {
          setSeatStatus(roomId, seatId, "idle");
          scheduleIdleToEmpty(roomId, seatId, reading?.ts_ms);
          return;
        }

        if (currentStatus === "idle" && idleTimerExists) {
          return;
        }

        setSeatStatus(roomId, seatId, "empty");
        return;
      }

      setSeatStatus(roomId, seatId, "idle");
    };

    const applyCameraSnapshot = (roomId, payload) => {
      const rows = rowsFromPayload(payload);
      rows.forEach((row) => applyReading(roomId, row));
    };

    const pollCurrent = async () => {
      const roomEntries = Object.entries(ROOM_CAMERA_MAP);

      const responses = await Promise.allSettled(
        roomEntries.map(([, cameraId]) => fetchCurrentOccupancy(cameraId)),
      );

      responses.forEach((result, index) => {
        const [roomId] = roomEntries[index];
        if (result.status === "fulfilled") {
          applyCameraSnapshot(roomId, result.value);
        } else {
          console.error(`Failed polling occupancy for ${roomId}`, result.reason);
        }
      });
    };

    pollCurrent();
    const intervalId = setInterval(pollCurrent, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      Object.values(idleTimersRef.current).forEach(clearTimeout);
      idleTimersRef.current = {};
    };
  }, []);

  const selectedRoomSeats = useMemo(() => {
    if (!activeRoom) {
      return {};
    }

    return occupancyByRoom[activeRoom] || {};
  }, [activeRoom, occupancyByRoom]);

  const handleSelectBuilding = (building) => {
    setSelectedBuilding(building);
    setActiveRoom(null);
  };

  const handleSelectRoom = (roomId) => {
    setActiveRoom(roomId);
  };

  const showLandingDirectory = !selectedBuilding;
  let screenContent = null;
  let centerClassName = "center";
  let leftClassName = "left";

  if (activeRoom === "r2020") {
    screenContent = <LayoutTwoZero seatStates={selectedRoomSeats} />;
  } else if (activeRoom === "r2037") {
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
