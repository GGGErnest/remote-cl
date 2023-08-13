import { Request, Response } from "express";
import { broadcast } from "../ws-server";
import { checkAuth } from "./authentication-routes";
import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { shells } from "../state/shells";
import { WSOutMessage } from "../types/ws-types";
import { homedir } from "os";
import { CommandProcessor } from "../logic/command-processor";
import { SSHCommand } from "../types/command-types";
import { Client } from 'ssh2';

const HOME_DIR = homedir();
const commandProcessor = new CommandProcessor();

function startSSH(shell:SpawnOptionsWithoutStdio ,command: SSHCommand): Client {
  const client = new Client();
  client.connect({
      host: command.server,
      port: command.port || 22,
      username: command.user,
      password: command.password,
  });
  return new Client()
}

function command(req: Request, res: Response) {
  const rawCommand = req.body.command;
  let threadId = req.body.threadId as string;
  const command = commandProcessor.process(rawCommand);
  console.log("Processed Command ", command);

  //   const allowedCommands = /^nordvpn (login|disconnect|set|whitelist|account|register|rate|settings|status|countries|cities|groups|logout) .+|^nordvpn connect (us|uk|ca|de|ar|c|d|s|h)\d*|^nordvpn (c|d|s|h)$/;
  //   if (!allowedCommands.test(command)) {
  //     return res.status(400).json({ message: 'Invalid command' });
  //   }

  // If no shell exists for this threadId, create one
  let shell = shells.get(threadId);

  if (shell) {
    shell.stdin.write(rawCommand + "\n");
    res.status(200).json({ message: "Command executed", threadId, command: rawCommand })

    return ;
  }

  // Cap the number of concurrent shells at 10
  if (Object.keys(shells).length >= 10 && !shells[threadId]) {
    return res.status(503).json({ message: "Server busy" });
  }

  res.status(200).json({ message: "Command executed", threadId, command: rawCommand })

  if (!threadId) {
    threadId = uuidv4();
  }

  const spawnOptions: SpawnOptionsWithoutStdio = {
    cwd: HOME_DIR,
    shell: true,
  };

  shell = spawn('/bin/bash', spawnOptions);
  shells[threadId] = shell;

  // writing the command
  shell.stdin.write(rawCommand + "\n");

  console.log("is New thread");

  // TODO: the outputs need to be stored in the sever too so the can be recover if the webapp disconnects
  shell.stdout.on("data", (data) => {
    const output = data.toString();
    console.log("Data received from shell " + threadId + " ", output);
    const message: WSOutMessage = { type: "Output", threadId, output };
    broadcast(message);
  });

  shell.stderr.on("data", (data) => {
    const shellError = data.toString();
    console.log("Error received from shell " + threadId + " ", shellError);
    const message: WSOutMessage = { type: "Output", threadId, shellError };
    broadcast(message);
  });

  shell.on("error", (error) => {
    const serverError = error.message;
    console.log("Server error in shell " + threadId + " ", serverError);
    const message: WSOutMessage = { type: "Output", threadId, serverError };
    broadcast(message);
  });

  shell.on("close", (errorCode) => {
    const exitMessage = `The process exited with code ${errorCode}`;
    console.log(exitMessage);
    const message: WSOutMessage = {
      type: "Output",
      threadId,
      output: exitMessage,
    };
  });
}

export function registerCommandRoutes(app: any) {
  // app.use("/command", checkAuth);
  app.post("/command", command);
}
