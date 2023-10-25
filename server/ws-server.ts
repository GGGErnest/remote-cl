import WebSocket, { WebSocketServer } from "ws";
import {
  WSInputMessage,
  WSMessage,
} from "./types/ws-types.js";
import { terminalsStorage } from "./state/shells.js";
import jwt from "jsonwebtoken";
import { checkWSAuthentication } from './logic/authentication.js';
const { verify } = jwt;

export let wss: WebSocketServer | undefined;

export function startWS(host = "localhost", port = 3001) {
  wss = new WebSocketServer({ host, port });
  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", (message: string) => {
      try {
        const inputMessage = JSON.parse(message) as WSInputMessage;
        if (checkWSAuthentication(inputMessage)) {
          console.warn("MEssage sent ->>>", inputMessage);
          const shell = terminalsStorage.get(inputMessage.terminalId);
          shell?.handleMessage(inputMessage);
        }
      } catch (error) {
        console.error("Error when parsing Websocket message ", message);
      }
    });

    // To keep the connection alive.
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping(() => {});
      }
    }, 30000);

    ws.send("Welcome to the WebSocket server");
  });

  console.log(`Websocket listening on ${host}:${port}`);
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
      // console.log("WS message Sent ->", data);
      client.send(JSON.stringify(data));
    }
  });
}
