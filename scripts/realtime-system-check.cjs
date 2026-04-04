const { spawn } = require("node:child_process");
const { io } = require("socket.io-client");

const SERVER_URL = "http://localhost:5000";
const MOCK_ENDPOINT = `${SERVER_URL}/api/occupancy/mock`;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startServer = () =>
  new Promise((resolve, reject) => {
    const child = spawn("node", ["server/server.js"], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Server start timeout"));
    }, 15000);

    child.stdout.on("data", (chunk) => {
      const output = chunk.toString();
      process.stdout.write(output);
      if (output.includes("Server running on port 5000")) {
        clearTimeout(timeout);
        resolve(child);
      }
    });

    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk.toString());
    });

    child.on("exit", (code) => {
      if (code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });

const postMockEvent = async (payload) => {
  const response = await fetch(MOCK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`POST ${MOCK_ENDPOINT} failed: ${response.status} ${text}`);
  }
};

const run = async () => {
  let serverProcess = null;
  let socket = null;

  try {
    serverProcess = await startServer();

    const receivedEvents = [];
    socket = io(SERVER_URL, {
      transports: ["websocket"],
      timeout: 10000,
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Socket connection timeout")),
        10000,
      );

      socket.on("connect", () => {
        clearTimeout(timeout);
        resolve();
      });
      socket.on("connect_error", reject);
    });

    socket.on("new_data", (event) => {
      receivedEvents.push(event);
      process.stdout.write(
        `new_data: camera=${event.camera_id}, station=${event.station_id}, occupied=${event.occupied}\n`,
      );
    });

    const now = Date.now();
    await postMockEvent({
      camera_id: "cam-1",
      computer_id: 6,
      ts_ms: now,
      occupied: 1,
      confidence: 0.95,
    });
    await wait(300);
    await postMockEvent({
      camera_id: "cam-1",
      computer_id: 6,
      ts_ms: now + 1000,
      occupied: 0,
      confidence: 0.89,
    });

    await wait(1200);

    if (receivedEvents.length < 2) {
      throw new Error(
        `Expected at least 2 socket events, received ${receivedEvents.length}`,
      );
    }

    const first = receivedEvents[0];
    const second = receivedEvents[1];
    if (Number(first.occupied) !== 1 || Number(second.occupied) !== 0) {
      throw new Error("Unexpected event sequence; expected occupied 1 then 0");
    }

    process.stdout.write("Realtime smoke test passed.\n");
    process.exitCode = 0;
  } finally {
    if (socket) {
      socket.close();
    }

    if (serverProcess) {
      serverProcess.kill("SIGTERM");
      await wait(300);
    }
  }
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
