import { getDB } from "../logic/database.js";
import { Request, Response } from "express";
import lodash from "lodash";
import { Server } from "../types/server-types.js";
import { terminalsStorage } from "../state/shells.js";

function getServers(req: Request, res: Response) {
  const servers = getDB().chain.get("servers").value();
  res.status(200).json({ message: "All servers", result: servers });
}

function getServer(req: Request, res: Response) {
  const server = getDB()
    .chain.get("servers")
    .find({ name: req.params.id })
    .value();
  res.status(200).json({ message: "All servers", result: server });
}

function addServer(req: Request, res: Response) {
  const server: Server = { ...req.body, runningShells: {} };
  const db = getDB();
  let servers = db.chain.get("servers").value();
  servers.push(server);
  db.write();
  return res.status(200).json({ message: "Server added", result: [server] });
}

function editServer(req: Request, res: Response) {
  const db = getDB();
  const servers = db.chain.get("servers");
  const server = servers.find({ name: req.params.name }).value();
  if (server) {
    lodash.merge(server, req.body);
    db.write();
    return res.status(200).json({ message: "Server Edited", result: [server] });
  }

  return res.status(404).json({ message: "Server not found", result: [] });
}

function deleteServer(req: Request, res: Response) {
  const db = getDB();
  const servers = db.chain.get("servers").value();
  const server = servers.find((item)=> item.name=== req.params.name );
  if (server) {
    //stopping all running terminals
    Object.keys(server.runningShells).forEach((terminalId)=> {
        const terminal = terminalsStorage.get(terminalId);
        if (terminal) {
            terminal.destroy();
            terminalsStorage.remove(terminalId);
          }
    })
    lodash.remove(servers, (item)=>item.name === server.name);
    db.write();
    return res.status(200).json({ message: "Server deleted", result: [server] });
  }

  return res.status(404).json({ message: "Server not found", result: [] });
}

export function registerServersRoutes(app: any) {
  // app.use("/servers", checkAuth);

  app.get("/servers", getServers);
  app.post("/servers", addServer);
  app.patch("/servers/:name", editServer);
  app.get("/servers/:id", getServer);
  app.delete("/servers/:name", deleteServer);
}
