import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { randomUUID } from "node:crypto";
import { extname, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = resolve(__dirname, "public");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";
const httpsEnabled = ["1", "true", "yes"].includes(
  String(process.env.HTTPS || "").toLowerCase(),
);
const certDir = resolve(__dirname, "certs");
const sslKeyPath =
  process.env.SSL_KEY_PATH || resolve(certDir, "localhost-key.pem");
const sslCertPath = process.env.SSL_CERT_PATH || resolve(certDir, "localhost.pem");
const protocol = httpsEnabled ? "https" : "http";
const rooms = new Map();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
};

const crossOriginIsolationHeaders = {
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

function writeHead(response, statusCode, headers = {}) {
  response.writeHead(statusCode, {
    ...crossOriginIsolationHeaders,
    ...headers,
  });
}

function getBaseUrl(request) {
  const requestHost = request.headers.host || `${host}:${port}`;
  return `${protocol}://${requestHost}`;
}

function createServerOptions() {
  if (!httpsEnabled) {
    return null;
  }

  if (!existsSync(sslKeyPath) || !existsSync(sslCertPath)) {
    throw new Error(
      [
        "HTTPS is enabled, but the TLS certificate files were not found.",
        `Expected key: ${sslKeyPath}`,
        `Expected cert: ${sslCertPath}`,
        "Generate local certs first or override SSL_KEY_PATH / SSL_CERT_PATH.",
      ].join("\n"),
    );
  }

  return {
    key: readFileSync(sslKeyPath),
    cert: readFileSync(sslCertPath),
  };
}

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }
  return rooms.get(roomId);
}

function sendEvent(client, event, payload) {
  client.response.write(`event: ${event}\n`);
  client.response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcast(roomId, event, payload, predicate = () => true) {
  const room = rooms.get(roomId);
  if (!room) return;

  for (const client of room.values()) {
    if (predicate(client)) {
      sendEvent(client, event, payload);
    }
  }
}

function removeClient(roomId, clientId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const client = room.get(clientId);
  if (!client) return;

  clearInterval(client.keepAlive);
  room.delete(clientId);

  broadcast(roomId, "peer-left", {
    clientId,
    role: client.role,
  });

  if (room.size === 0) {
    rooms.delete(roomId);
  }
}

function handleEvents(request, response, url) {
  const roomId = url.searchParams.get("room") || "demo";
  const role = url.searchParams.get("role") || "observer";
  const clientId = url.searchParams.get("client") || randomUUID();
  const room = getRoom(roomId);

  writeHead(response, 200, {
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "X-Accel-Buffering": "no",
  });

  const client = {
    clientId,
    role,
    response,
    keepAlive: setInterval(() => {
      response.write(": keep-alive\n\n");
    }, 25000),
  };

  room.set(clientId, client);

  sendEvent(client, "open", {
    clientId,
    room: roomId,
    peers: Array.from(room.values())
      .filter((peer) => peer.clientId !== clientId)
      .map((peer) => ({ clientId: peer.clientId, role: peer.role })),
  });

  broadcast(
    roomId,
    "peer-joined",
    { clientId, role },
    (peer) => peer.clientId !== clientId,
  );

  request.on("close", () => removeClient(roomId, clientId));
}

function readJsonBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let raw = "";

    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        request.destroy();
        rejectBody(new Error("Request body is too large"));
      }
    });

    request.on("end", () => {
      try {
        resolveBody(raw ? JSON.parse(raw) : {});
      } catch (error) {
        rejectBody(error);
      }
    });
  });
}

async function handleSignal(request, response) {
  try {
    const body = await readJsonBody(request);
    const { room, clientId, role, targetRole, message } = body;

    if (!room || !clientId || !role || !message) {
      writeHead(response, 400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Missing signaling fields" }));
      return;
    }

    broadcast(
      room,
      "signal",
      { from: clientId, role, message },
      (peer) =>
        peer.clientId !== clientId && (!targetRole || peer.role === targetRole),
    );

    writeHead(response, 204);
    response.end();
  } catch (error) {
    writeHead(response, 400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: error.message }));
  }
}

function resolveSdkPath(pathname) {
  const relativePath = pathname.replace(/^\/shenai-sdk\/?/, "");
  const sdkDir = resolve(publicDir, "shenai-sdk");
  const filePath = resolve(sdkDir, relativePath || "index.mjs");

  if (isSafePath(sdkDir, filePath) && existsSync(filePath)) {
    return filePath;
  }

  return null;
}

function isSafePath(root, filePath) {
  const result = relative(root, filePath);
  return result === "" || (!result.startsWith("..") && !result.includes(".."));
}

function sendFile(response, filePath) {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    writeHead(response, 404);
    response.end("Not found");
    return;
  }

  writeHead(response, 200, {
    "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}

function handleStatic(request, response, url) {
  if (url.pathname.startsWith("/shenai-sdk")) {
    const sdkPath = resolveSdkPath(url.pathname);
    if (sdkPath) {
      sendFile(response, sdkPath);
      return;
    }

    writeHead(response, 404);
    response.end("Shen.AI Web SDK was not found.");
    return;
  }

  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = resolve(publicDir, normalize(`.${pathname}`));

  if (!isSafePath(publicDir, filePath)) {
    writeHead(response, 403);
    response.end("Forbidden");
    return;
  }

  sendFile(response, filePath);
}

const requestHandler = async (request, response) => {
  const url = new URL(request.url, getBaseUrl(request));

  if (request.method === "GET" && url.pathname === "/events") {
    handleEvents(request, response, url);
    return;
  }

  if (request.method === "POST" && url.pathname === "/signal") {
    await handleSignal(request, response);
    return;
  }

  if (request.method === "GET") {
    handleStatic(request, response, url);
    return;
  }

  writeHead(response, 405);
  response.end("Method not allowed");
};

const server = httpsEnabled
  ? createHttpsServer(createServerOptions(), requestHandler)
  : createHttpServer(requestHandler);

server.listen(port, host, () => {
  const printHost = host === "0.0.0.0" ? "localhost" : host;

  console.log(`Shen.AI WebRTC example running at ${protocol}://${printHost}:${port}`);
  console.log(
    `Patient: ${protocol}://${printHost}:${port}/?room=demo&role=patient`,
  );
  console.log(
    `Doctor:  ${protocol}://${printHost}:${port}/?room=demo&role=doctor`,
  );

  if (httpsEnabled) {
    console.log(`TLS key:  ${sslKeyPath}`);
    console.log(`TLS cert: ${sslCertPath}`);
  }

  if (host === "0.0.0.0") {
    console.log("LAN: use your machine IP in the browser URL.");
  }
});
