import { Request, Response } from "express";
import { broadcast } from "../ws-server";
import { checkAuth } from "./authentication-routes";
import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { shells } from "../state/shells";
import { WSOutMessage } from "../types/ws-types";


function command(req: Request, res: Response){
    const command = req.body.command;
    let threadId = req.body.threadId as string;
  
    //   const allowedCommands = /^nordvpn (login|disconnect|set|whitelist|account|register|rate|settings|status|countries|cities|groups|logout) .+|^nordvpn connect (us|uk|ca|de|ar|c|d|s|h)\d*|^nordvpn (c|d|s|h)$/;
    //   if (!allowedCommands.test(command)) {
    //     return res.status(400).json({ message: 'Invalid command' });
    //   }
  
    // Cap the number of concurrent shells at 10
    if (Object.keys(shells).length >= 10 && !shells[threadId]) {
      return res.status(503).json({ message: "Server busy" });
    }
  
    let newThread = false;
  
    // If no shell exists for this threadId, create one
    if (!shells[threadId]) {
      if (!threadId) {
        threadId = uuidv4();
      }
      shells[threadId] = spawn("/bin/bash");
      newThread = true;
    }
  
    let shell = shells[threadId];
  
    if (newThread) {
      console.log("is New thread");
  
      // TODO: the outputs need to be stored in the sever too so the can be recover if the webapp disconnects
      shell.stdout.on("data", (data) => {
        const output = data.toString();
        console.log("Data received from shell " + threadId +" ", output);
        const message: WSOutMessage = { type:"Output", threadId, output };
        broadcast(message);
      });
  
      shell.stderr.on("data", (data) => {
        const shellError = data.toString();
        console.log("Error received from shell " + threadId +" ", shellError);
        const message: WSOutMessage = { type:"Output", threadId, shellError };
        broadcast(message);
      });
  
      shell.on("error", (error) => {
        const serverError = error.message;
        console.log("Server error in shell " + threadId +" ", serverError);
        const message: WSOutMessage = { type:"Output", threadId, serverError };
        broadcast(message);
      });
    }
    
    res.status(200).json({ message: "Command executed", threadId, command });
    shell.stdin.write(command + "\n");
  }

export function registerCommandRoutes(app: any) {
    // app.use("/command", checkAuth);
    app.post("/command", command);
  }