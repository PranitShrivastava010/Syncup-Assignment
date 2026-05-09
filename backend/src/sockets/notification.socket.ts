import type { IncomingMessage, Server } from "http";
import jwt from "jsonwebtoken";
import { WebSocket, WebSocketServer } from "ws";
import { JWT_CONFIG } from "../config/jwtConfig";

type SocketPayload = Record<string, unknown>;

const clients = new Map<string, Set<WebSocket>>();

const getTokenFromRequest = (req: IncomingMessage) => {
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "", `http://${host}`);
  return url.searchParams.get("token");
};

const addClient = (userId: string, socket: WebSocket) => {
  const userClients = clients.get(userId) ?? new Set<WebSocket>();
  userClients.add(socket);
  clients.set(userId, userClients);
};

const removeClient = (userId: string, socket: WebSocket) => {
  const userClients = clients.get(userId);

  if (!userClients) {
    return;
  }

  userClients.delete(socket);

  if (userClients.size === 0) {
    clients.delete(userId);
  }
};

export const initializeNotificationSocket = (server: Server) => {
  const wss = new WebSocketServer({
    server,
    path: "/ws/notifications",
  });

  wss.on("connection", (socket, req) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      socket.close(1008, "Missing token");
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_CONFIG.ACCESS_SECRET) as {
        userId: string;
      };

      addClient(decoded.userId, socket);

      socket.send(
        JSON.stringify({
          type: "CONNECTED",
          message: "Notification socket connected",
        })
      );

      socket.on("close", () => removeClient(decoded.userId, socket));
    } catch {
      socket.close(1008, "Invalid token");
    }
  });

  return wss;
};

export const emitNotificationToUser = (
  userId: string,
  payload: SocketPayload
) => {
  const userClients = clients.get(userId);

  if (!userClients) {
    return;
  }

  const message = JSON.stringify({
    type: "NOTIFICATION",
    data: payload,
  });

  userClients.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  });
};
