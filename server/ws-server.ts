import WebSocket, { WebSocketServer } from "ws";
import { WSMessage } from "./types/ws-types";

export let wss: WebSocketServer | undefined;

export function startWS(port = 3001) {
  wss = new WebSocketServer({ port });

  wss.on("connection", (ws: any) => {
    ws.on("message", (message: any) => {
      console.log("Received:", message);
    });

    // To keep the connection alive.
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping(() => {});
      }
    }, 30000);

    ws.send("Welcome to the WebSocket server");
  });

  console.log("Websocket listening on localhost " + port);
}

export function broadcast(data: WSMessage) {
  if (!wss) {
    console.error("WS not defined");
    return;
  }

  if (wss.clients.size === 0) {
    console.warn("WS has not clients connected");
    return;
  }

  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      console.log("WS message Sent ->", data);
      client.send(JSON.stringify(data));
    }
  });
}
