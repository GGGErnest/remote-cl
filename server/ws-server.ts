import WebSocket, { WebSocketServer } from "ws";
import { WSInputMessage, WSMessage } from "./types/ws-types.js";
import { terminalsStorage } from "./state/shells.js";

export let wss: WebSocketServer | undefined;

export function startWS(host = 'localhost',port = 3001) {
  wss = new WebSocketServer({ host, port });
  wss.on("connection", (ws: any) => {
    ws.on("message", (message: any) => {
      // console.log("Received:", message);
      
      try {
        const inputMessage = (JSON.parse(message) as WSInputMessage);
        // console.log("Parsed Message Received:", inputMessage);
        const shell = terminalsStorage.get(inputMessage.terminalId);
        shell?.write(inputMessage.message);
      } catch (error) {
        console.error('Error when parsing Websocket message ', message);
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
