import { Request, Response } from "express";
import { checkAuth } from "./authentication-routes.js";
import { terminalsStorage } from "../state/shells.js";
import { getDB } from "../logic/database.js";
import { SSHTerminal } from "../logic/ssh-shell.js";
import { Server } from "../types/server-types.js";
import lodash from "lodash";

export function deleteTerminal(terminalId: string) {
  const terminal = terminalsStorage.get(terminalId);
  if (terminal) {
    terminal.destroy();
    terminalsStorage.remove(terminalId);
    const server = getDB()
      .chain.get("servers")
      .find((server) => {
        return server.runningShells[terminalId] ? true : false;
      })
      .value();
    delete server.runningShells[terminalId];
    getDB().write();
    return true;
  }
  return false;
}

function getTerminals(req: Request, res: Response) {
  // Return a list of all running threadIds
  res
    .status(200)
    .json({ message: "All threads", result: terminalsStorage.getIds() });
}

function deleteTerminalRequest(req: Request, res: Response) {
  const terminalId = req.params.id;

  if (deleteTerminal(terminalId)) {
    res
      .status(200)
      .json({
        message: `Thread ${terminalId} terminated`,
        result: [terminalId],
      });
  } else {
    res.status(404).json({ message: `Thread ${terminalId} not found` });
  }
}

function getTerminalHistory(req: Request, res: Response) {
  const terminalData = terminalsStorage.get(req.params.id);
  if (terminalData) {
    const messages: string[] = [];
    terminalData
      .getHistory()
      .getMessages()
      .forEach((message) => {
        messages.push(message.message);
      });
    return res.status(200).json({ message: "Shell history", result: messages });
  }

  return res
    .status(400)
    .json({ message: "Shell not found", result: undefined });
}

/**
 *
 * @param server
 * @param providedTerminalId
 * @returns Return a tuple where the first element is the id that will from the FE side and
 * the second element is the terminal id on the terminal storage side
 */
function generateTerminalId(
  server: Server,
  providedTerminalId?: string
): [string, string] {
  if (!providedTerminalId) {
    const idGenerated = lodash.uniqueId();
    return [idGenerated, idGenerated];
  }

  if (server.runningShells[providedTerminalId]) {
    const idGenerated = lodash.uniqueId();
    return [idGenerated, idGenerated];
  }

  if (terminalsStorage.get(providedTerminalId)) {
    return [providedTerminalId, lodash.uniqueId()];
  }

  return [providedTerminalId, providedTerminalId];
}

function create(req: Request, res: Response) {
  const server = getDB()
    .chain.get("servers")
    .find({ name: req.body.server })
    .value();
  let terminalIDs = generateTerminalId(server, req.body.terminalId);
  
  if (server?.connectionSettings) {
    console.log("Connection info ", server.connectionSettings);
    const shell = new SSHTerminal(terminalIDs[0], server.connectionSettings);
    terminalsStorage.add(terminalIDs[1], shell);
    const result:any = {};
    result[terminalIDs[0]] = terminalIDs[1];

    lodash.assignIn(server.runningShells, result);
    getDB().write();
    return res.status(200).json({ message: "Terminal created", result });
  }

  return res
    .status(400)
    .json({ message: "Server not found", result: undefined });
}

export function registerTerminalRoutes(app: any) {
  const baseUrl = "/terminals/";
  app.use(baseUrl, checkAuth);
  app.use(baseUrl + ":id/history", checkAuth);
  app.use(baseUrl + ":id", checkAuth);

  app.get(baseUrl, getTerminals);
  app.post(baseUrl, create);
  app.get(baseUrl + ":id/history", getTerminalHistory);
  app.delete(baseUrl + ":id", deleteTerminalRequest);
}
