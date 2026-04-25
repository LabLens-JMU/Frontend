import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { fetchCurrentOccupancy, fetchData } from "../../api/dataApi";
import "../../css/Graph.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const HOURS_TO_SHOW = 24;
const DAYS_TO_SHOW = 7;
const WEEKLY_HOURS_TO_SHOW = DAYS_TO_SHOW * 24;
const EMPTY_STATE = "0";
const FUTURE_SKEW_TOLERANCE_MS = 5 * 60 * 1000;
const TOTAL_LAB_SEATS = 62;
const GRAPH_MODE = {
  LINE: "line",
  BAR: "bar",
};
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ROOM_CONFIG = [
  {
    cameraId: "cam-1",
    label: "Room 2020",
    color: "rgb(255, 99, 132)",
    background: "rgba(255, 99, 132, 0.18)",
  },
  {
    cameraId: "cam-2",
    label: "Room 2037",
    color: "rgb(53, 162, 235)",
    background: "rgba(53, 162, 235, 0.18)",
  },
  {
    cameraId: "cam-3",
    label: "Room 2039",
    color: "rgb(75, 192, 192)",
    background: "rgba(75, 192, 192, 0.18)",
  },
];

const toMs = (value) => {
  const timestamp = Number(value);
  return Number.isFinite(timestamp) ? timestamp : null;
};

const toStationId = (reading) => {
  const stationId = Number(reading?.computer_id ?? reading?.station_id);
  return Number.isFinite(stationId) ? stationId : null;
};

const toOccupancyState = (value) => String(value ?? EMPTY_STATE);

const isOccupied = (value) => toOccupancyState(value) !== EMPTY_STATE;

const startOfHour = (timestamp) => {
  const date = new Date(timestamp);
  date.setMinutes(0, 0, 0);
  return date.getTime();
};

const formatHourLabel = (timestamp) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
  }).format(timestamp);

const buildHourBuckets = (now) => {
  const currentHour = startOfHour(now);
  return Array.from({ length: HOURS_TO_SHOW }, (_, index) => {
    const hourStart = currentHour - (HOURS_TO_SHOW - index - 1) * 60 * 60 * 1000;

    return {
      hourStart,
      hourEnd: hourStart + 60 * 60 * 1000 - 1,
      label: formatHourLabel(hourStart),
    };
  });
};

const buildRollingHourBuckets = (now, totalHours) => {
  const currentHour = startOfHour(now);
  return Array.from({ length: totalHours }, (_, index) => {
    const hourStart = currentHour - (totalHours - index - 1) * 60 * 60 * 1000;

    return {
      hourStart,
      hourEnd: hourStart + 60 * 60 * 1000 - 1,
    };
  });
};

const getHistoryRows = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.events)) {
    return payload.events;
  }

  return [];
};

const normalizeHistory = (payload) => {
  return getHistoryRows(payload)
    .map((reading) => {
      const ts = toMs(reading?.ts_ms);
      const stationId = toStationId(reading);
      const cameraId = String(reading?.camera_id ?? "").trim().toLowerCase();

      if (!ts || !stationId || !cameraId) {
        return null;
      }

      return {
        cameraId,
        stationId,
        occupied: toOccupancyState(reading?.occupied),
        ts,
      };
    })
    .filter(Boolean);
};

const normalizeCurrent = (payload, fallbackCameraId) => {
  if (!payload) {
    return [];
  }

  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.computers)
      ? payload.computers.map((computer) => ({
          camera_id: payload.camera_id ?? fallbackCameraId,
          ...computer,
        }))
      : [payload];

  return rows
    .map((reading) => {
      const stationId = toStationId(reading);
      const cameraId = String(
        reading?.camera_id ?? fallbackCameraId ?? "",
      ).trim().toLowerCase();

      if (!stationId || !cameraId) {
        return null;
      }

      return {
        cameraId,
        stationId,
        occupied: toOccupancyState(reading?.occupied),
      };
    })
    .filter(Boolean);
};

const buildStationHistoryMap = (historyRows, currentRows) => {
  const byStation = new Map();

  for (const row of historyRows) {
    const key = `${row.cameraId}:${row.stationId}`;
    const existing = byStation.get(key) ?? [];
    existing.push({ ts: row.ts, occupied: row.occupied });
    byStation.set(key, existing);
  }

  for (const entries of byStation.values()) {
    entries.sort((left, right) => left.ts - right.ts);
  }

  for (const row of currentRows) {
    const key = `${row.cameraId}:${row.stationId}`;
    if (!byStation.has(key)) {
      byStation.set(key, []);
    }
  }

  return byStation;
};

const buildCurrentStateMap = (currentRows) => {
  const state = new Map();

  for (const row of currentRows) {
    state.set(`${row.cameraId}:${row.stationId}`, row.occupied);
  }

  return state;
};

const resolveStationStateAtTimestamp = (
  events = [],
  currentState,
  timestamp,
  { allowCurrentFallback = false } = {},
) => {
  let latestAtOrBeforeTimestamp = null;

  for (const event of events) {
    if (event.ts <= timestamp) {
      latestAtOrBeforeTimestamp = event;
      continue;
    }

    break;
  }

  if (latestAtOrBeforeTimestamp) {
    return latestAtOrBeforeTimestamp.occupied;
  }

  return allowCurrentFallback ? currentState ?? null : null;
};

const buildHourlyDatasets = (historyRows, currentRows, now) => {
  const hours = buildHourBuckets(now);
  const stationHistoryMap = buildStationHistoryMap(historyRows, currentRows);
  const currentStateMap = buildCurrentStateMap(currentRows);

  return ROOM_CONFIG.map((room) => {
    const roomStationKeys = Array.from(stationHistoryMap.keys()).filter((key) =>
      key.startsWith(`${room.cameraId}:`),
    );

    const data = hours.map(({ hourEnd }, index) => {
      let occupiedCount = 0;
      let sampledStations = 0;

      for (const stationKey of roomStationKeys) {
        const events = stationHistoryMap.get(stationKey) ?? [];
        const currentState = currentStateMap.get(stationKey);
        const stationState =
          index === hours.length - 1
            ? currentState ??
              resolveStationStateAtTimestamp(events, currentState, now, {
                allowCurrentFallback: true,
              })
            : resolveStationStateAtTimestamp(events, currentState, hourEnd);

        if (stationState == null) {
          continue;
        }

        sampledStations += 1;
        if (isOccupied(stationState)) {
          occupiedCount += 1;
        }
      }

      return sampledStations > 0 ? occupiedCount : null;
    });

    return {
      label: room.label,
      data,
      borderColor: room.color,
      backgroundColor: room.background,
      tension: 0.35,
      spanGaps: true,
      borderWidth: 2,
      pointHoverRadius: 6,
      pointRadius: data.map((_, index) => (index === data.length - 1 ? 4 : 2)),
      pointBackgroundColor: data.map((_, index) =>
        index === data.length - 1 ? room.color : "#ffffff",
      ),
      pointBorderWidth: data.map((_, index) => (index === data.length - 1 ? 2 : 1)),
    };
  });
};

const buildRoomStationKeys = (stationHistoryMap) => {
  const allowedRooms = new Set(ROOM_CONFIG.map((room) => room.cameraId));

  return Array.from(stationHistoryMap.keys()).filter((key) => {
    const [cameraId] = key.split(":");
    return allowedRooms.has(cameraId);
  });
};

const resolveOccupiedCountAtTimestamp = (
  stationKeys,
  stationHistoryMap,
  currentStateMap,
  timestamp,
  { allowCurrentFallback = false } = {},
) => {
  let occupiedCount = 0;
  let sampledStations = 0;

  for (const stationKey of stationKeys) {
    const events = stationHistoryMap.get(stationKey) ?? [];
    const currentState = currentStateMap.get(stationKey);
    const stationState = resolveStationStateAtTimestamp(events, currentState, timestamp, {
      allowCurrentFallback,
    });

    if (stationState == null) {
      continue;
    }

    sampledStations += 1;
    if (isOccupied(stationState)) {
      occupiedCount += 1;
    }
  }

  return { occupiedCount, sampledStations };
};

const buildWeeklyAvailabilityDataset = (
  historyRows,
  currentRows,
  now,
  totalSeats = TOTAL_LAB_SEATS,
) => {
  const hourBuckets = buildRollingHourBuckets(now, WEEKLY_HOURS_TO_SHOW);
  const stationHistoryMap = buildStationHistoryMap(historyRows, currentRows);
  const currentStateMap = buildCurrentStateMap(currentRows);
  const stationKeys = buildRoomStationKeys(stationHistoryMap);
  const weekdayTotals = WEEKDAY_LABELS.map(() => ({ availableSum: 0, samples: 0 }));

  hourBuckets.forEach(({ hourStart, hourEnd }, index) => {
    const { occupiedCount, sampledStations } = resolveOccupiedCountAtTimestamp(
      stationKeys,
      stationHistoryMap,
      currentStateMap,
      hourEnd,
      { allowCurrentFallback: index === hourBuckets.length - 1 },
    );

    if (sampledStations === 0) {
      return;
    }

    const weekdayIndex = new Date(hourStart).getDay();
    const availableSeats = Math.max(totalSeats - occupiedCount, 0);
    weekdayTotals[weekdayIndex].availableSum += availableSeats;
    weekdayTotals[weekdayIndex].samples += 1;
  });

  return {
    labels: WEEKDAY_LABELS,
    datasets: [
      {
        label: `Avg available seats (x/${totalSeats})`,
        data: weekdayTotals.map(({ availableSum, samples }) =>
          samples > 0 ? Number((availableSum / samples).toFixed(1)) : null,
        ),
        backgroundColor: "rgba(34, 197, 94, 0.55)",
        borderColor: "rgb(22, 163, 74)",
        borderWidth: 1.5,
      },
    ],
  };
};

const getLatestHistoryTimestamp = (historyRows) => {
  if (!Array.isArray(historyRows) || historyRows.length === 0) {
    return null;
  }

  return historyRows.reduce((latest, row) => Math.max(latest, row.ts ?? 0), 0);
};

const resolveTimelineNow = (clockNow, historyRows) => {
  const latestHistoryTs = getLatestHistoryTimestamp(historyRows);

  if (!latestHistoryTs) {
    return clockNow;
  }

  // Some data sources can drift ahead of client time; anchor to latest source time
  // so recent hourly history still plots instead of collapsing to live-only dots.
  if (latestHistoryTs - clockNow > FUTURE_SKEW_TOLERANCE_MS) {
    return latestHistoryTs;
  }

  return clockNow;
};

const Graph = () => {
  const [chartRows, setChartRows] = useState({ history: [], current: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");
  const [clockTick, setClockTick] = useState(Date.now());
  const [chartMode, setChartMode] = useState(GRAPH_MODE.LINE);

  useEffect(() => {
    let cancelled = false;

    const loadGraphData = async () => {
      try {
        const now = Date.now();
        const historySinceTs =
          startOfHour(now) - (WEEKLY_HOURS_TO_SHOW - 1) * 60 * 60 * 1000;
        const [historyPayload, ...currentPayloads] = await Promise.all([
          fetchData({ sinceTs: historySinceTs }),
          ...ROOM_CONFIG.map((room) =>
            fetchCurrentOccupancy(room.cameraId).catch((fetchError) => {
              if (fetchError?.message?.includes("404")) {
                return null;
              }

              return null;
            }),
          ),
        ]);

        if (cancelled) {
          return;
        }

        const history = normalizeHistory(historyPayload);
        const current = currentPayloads.flatMap((payload, index) =>
          normalizeCurrent(payload, ROOM_CONFIG[index].cameraId),
        );

        setChartRows({ history, current });
        setLastUpdated(now);
        setError("");
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load graph data", fetchError);
        setError("Unable to load the latest occupancy trend right now.");
      }
    };

    loadGraphData();
    const timer = setInterval(loadGraphData, FIVE_MINUTES_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick(Date.now());
    }, 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const chartData = useMemo(() => {
    const now = resolveTimelineNow(clockTick, chartRows.history);
    const hours = buildHourBuckets(now);

    return {
      labels: hours.map((hour) => hour.label),
      datasets: buildHourlyDatasets(chartRows.history, chartRows.current, now),
    };
  }, [chartRows, clockTick]);

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Live Occupancy Trend by Hour",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              if (value == null) {
                return `${context.dataset.label}: no reading`;
              }

              return `${context.dataset.label}: ${value} occupied seats`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
          title: {
            display: true,
            text: "Occupied seats",
          },
        },
        x: {
          title: {
            display: true,
            text: "Last 24 hours",
          },
        },
      },
    }),
    [],
  );

  const weeklyAvailability = useMemo(() => {
    const now = resolveTimelineNow(clockTick, chartRows.history);
    return buildWeeklyAvailabilityDataset(chartRows.history, chartRows.current, now);
  }, [chartRows, clockTick]);

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Average Available Seats by Day (Last 7 Days)",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              if (value == null) {
                return "No samples yet";
              }

              return `${context.dataset.label}: ${value}/${TOTAL_LAB_SEATS}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: TOTAL_LAB_SEATS,
          ticks: {
            precision: 0,
          },
          title: {
            display: true,
            text: "Available seats",
          },
        },
        x: {
          title: {
            display: true,
            text: "Day of week",
          },
        },
      },
    }),
    [],
  );

  return (
    <div className="chart-container">
      {chartMode === GRAPH_MODE.LINE ? (
        <>
          <Line options={lineOptions} data={chartData} />
          <p className="graph-meta">
            Each finished hour is locked to its end-of-hour occupancy. The current hour stays
            live.
          </p>
        </>
      ) : (
        <>
          <Bar options={barOptions} data={weeklyAvailability} />
          <p className="graph-meta">
            Weekly bars show historical average available seats across all configured rooms
            (x/{TOTAL_LAB_SEATS}) using hourly snapshots.
          </p>
        </>
      )}
      {lastUpdated && (
        <p className="graph-meta">
          Last updated at{" "}
          {new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }).format(lastUpdated)}
        </p>
      )}
      {error && <p className="graph-meta graph-error">{error}</p>}
      <div className="graph-toggle-wrap" role="group" aria-label="Graph type toggle">
        <button
          type="button"
          className={`graph-toggle-btn ${chartMode === GRAPH_MODE.LINE ? "active" : ""}`}
          onClick={() => setChartMode(GRAPH_MODE.LINE)}
        >
          Line graph
        </button>
        <button
          type="button"
          className={`graph-toggle-btn ${chartMode === GRAPH_MODE.BAR ? "active" : ""}`}
          onClick={() => setChartMode(GRAPH_MODE.BAR)}
        >
          Bar graph
        </button>
      </div>
    </div>
  );
};

export default Graph;
