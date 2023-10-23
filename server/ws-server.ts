import WebSocket, { WebSocketServer } from "ws";
import {
  WSAuthErrorMessage,
  WSInputMessage,
  WSMessage,
} from "./types/ws-types.js";
import { terminalsStorage } from "./state/shells.js";
import { getDB } from "./logic/database.js";
import jwt from "jsonwebtoken";
const { verify } = jwt;

export let wss: WebSocketServer | undefined;

function checkAuthentication(message: WSInputMessage): boolean {
  const accessTokenSecret = getDB().chain.get("authentication").value().secret;

  if (message.accessToken) {
    try {
      verify(message.accessToken, accessTokenSecret);
      return true;
    } catch (err: any) {
      console.warn("Auth validation result", err);
      switch (err.name) {
        case "TokenExpiredError":
          broadcast({
            type: "AuthError",
            output: "TokenExpired",
          } as WSAuthErrorMessage);
          break;
        case "JsonWebTokenError":
          broadcast({
            type: "AuthError",
            output: "JsonWebTokenError",
          } as WSAuthErrorMessage);
          break;
        default:
          break;
      }

      return false;
    }
  }
  return false;
}

export function startWS(host = "localhost", port = 3001) {
  wss = new WebSocketServer({ host, port });
  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", (message: string) => {
      try {
        const inputMessage = JSON.parse(message) as WSInputMessage;
        if (checkAuthentication(inputMessage)) {
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
