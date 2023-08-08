import WebSocket, {Server} from "ws";
import { WSMessage } from "./types/ws-types";

export let wss: Server | undefined;


export function startWS(port = 3001) {
   wss = new Server({ port });

   wss.on("connection", (ws:any) => {
    ws.on('message', (message:any) => {
        console.log('Received:', message);
      });
    
    ws.send('Welcome to the WebSocket server');
  });
  console.log("Websocket listening on localhost " + port);
}

export function broadcast(data: WSMessage) {
  if(!wss) {
    console.error("WS not defined");
    return;
  }

  if(wss.clients.size=== 0){
    console.warn("WS has not clients connected");
    return;
  }

  wss.clients.forEach((client:any) => {
    if (client.readyState === WebSocket.OPEN) {
      console.log('WS message Sent ->', data);
      client.send(JSON.stringify(data));
    }
  })
  }