import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { fetchCurrentOccupancy, fetchData } from "../../api/dataApi";
import "../../css/Graph.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const HOURS_TO_SHOW = 24;
const EMPTY_STATE = "0";
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

let globalHistoryCache = [];

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

const normalizeHistory = (payload) => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
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

const Graph = () => {
  const [chartRows, setChartRows] = useState({ history: [], current: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");
  const [clockTick, setClockTick] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;

    const loadGraphData = async () => {
      try {
        const now = Date.now();
        const historySinceTs =
          startOfHour(now) - (HOURS_TO_SHOW - 1) * 60 * 60 * 1000;

        const latestTs = globalHistoryCache.length > 0
          ? Math.max(...globalHistoryCache.map((row) => row.ts))
          : null;
        const fetchSinceTs = latestTs ? latestTs + 1 : historySinceTs;

        const [historyPayload, ...currentPayloads] = await Promise.all([
          fetchData({ sinceTs: fetchSinceTs }),
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

        const newHistory = normalizeHistory(historyPayload);
        const current = currentPayloads.flatMap((payload, index) =>
          normalizeCurrent(payload, ROOM_CONFIG[index].cameraId),
        );

        // Deduplicate incoming history against our cache (to handle seed overlap)
        const existingKeys = new Set(
          globalHistoryCache.map((row) => `${row.cameraId}:${row.stationId}:${row.ts}`)
        );
        const uniqueNewHistory = newHistory.filter(
          (row) => !existingKeys.has(`${row.cameraId}:${row.stationId}:${row.ts}`)
        );

        // Merge the delta and prune events older than 7 days to prevent memory leaks
        let mergedHistory = [...globalHistoryCache, ...uniqueNewHistory];
        mergedHistory = mergedHistory.filter((row) => row.ts >= historySinceTs);
        globalHistoryCache = mergedHistory;

        setChartRows({ history: mergedHistory, current });
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
    const now = clockTick;
    const hours = buildHourBuckets(now);

    return {
      labels: hours.map((hour) => hour.label),
      datasets: buildHourlyDatasets(chartRows.history, chartRows.current, now),
    };
  }, [chartRows, clockTick]);

  const options = useMemo(
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

  return (
    <div className="chart-container">
      <Line options={options} data={chartData} />
      <p className="graph-meta">
        Each finished hour is locked to its end-of-hour occupancy. The current hour stays live.
      </p>
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
    </div>
  );
};

export default Graph;
