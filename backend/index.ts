import "dotenv/config";
import http from "http";
import app from "./src/app";
import { initializeNotificationSocket } from "./src/sockets/notification.socket";

const PORT = Number(process.env.PORT ?? 5000);

if (process.env.VERCEL !== "1") {
  const server = http.createServer(app);
  initializeNotificationSocket(server);

  server.listen(PORT, () => {
    console.log(`Syncup_backend API running on port ${PORT}`);
    console.log(`Notification WebSocket ready at /ws/notifications`);
  });
}

export default app;

