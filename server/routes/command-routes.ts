import { Request, Response, raw } from "express";
import { broadcast } from "../ws-server";
import { checkAuth } from "./authentication-routes";
import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { shells } from "../state/shells";
import { WSOutMessage } from "../types/ws-types";
import { homedir } from "os";
import { CommandProcessor } from "../logic/command-processor";
import { SSHCommand } from "../types/command-types";
import {
  Client,
  ConnectConfig,
  KeyboardInteractiveAuthMethod,
  PasswordAuthMethod,
  PublicKeyAuthMethod,
} from "ssh2";
import { readFileSync } from "fs";
import { settings } from "../state/settings";
import {createInterface} from 'readline';
import { SSHShell } from "../logic/ssh-shell";

const HOME_DIR = homedir();
const commandProcessor = new CommandProcessor();

function createSSHShell(shellId: string, command: SSHCommand) {
  const connectionConf:ConnectConfig = {
    host:command.server,
    username:command.user,
    password: command.password,
    port:command.port ?? 22
  };
  const shell = new SSHShell(shellId,connectionConf);
  shells.add(shellId, shell);
}

function startChildProcess(shellId: string, command: string) {
  const spawnOptions: SpawnOptionsWithoutStdio = {
    cwd: HOME_DIR,
    shell: true,
  };

  let shell = spawn("/bin/bash", spawnOptions);
  shells.add(shellId, shell);

  // writing the command
  shell.stdin.write(command + "\n");

  console.log("is New thread");

  // TODO: the outputs need to be stored in the sever too so the can be recover if the webapp disconnects
  shell.stdout.on("data", (data) => {
    const output = data.toString();
    console.log("Data received from shell " + shellId + " ", output);
    const message: WSOutMessage = { type: "Output", threadId: shellId, output };
    broadcast(message);
  });

  shell.stderr.on("data", (data) => {
    const shellError = data.toString();
    console.log("Error received from shell " + shellId + " ", shellError);
    const message: WSOutMessage = {
      type: "Output",
      threadId: shellId,
      shellError,
    };
    broadcast(message);
  });

  shell.on("error", (error) => {
    const serverError = error.message;
    console.log("Server error in shell " + shellId + " ", serverError);
    const message: WSOutMessage = {
      type: "Output",
      threadId: shellId,
      serverError,
    };
    broadcast(message);
  });

  shell.on("close", (errorCode) => {
    const exitMessage = `The process exited with code ${errorCode}`;
    console.log(exitMessage);
    const message: WSOutMessage = {
      type: "Output",
      threadId: shellId,
      output: exitMessage,
    };
    broadcast(message);
  });
}

function command(req: Request, res: Response) {
  const rawCommand = req.body.command;
  let shellId = req.body.threadId as string;
  const command = commandProcessor.process(rawCommand);
  console.log("Processed Command ", command);

  //   const allowedCommands = /^nordvpn (login|disconnect|set|whitelist|account|register|rate|settings|status|countries|cities|groups|logout) .+|^nordvpn connect (us|uk|ca|de|ar|c|d|s|h)\d*|^nordvpn (c|d|s|h)$/;
  //   if (!allowedCommands.test(command)) {
  //     return res.status(400).json({ message: 'Invalid command' });
  //   }

  let shell = shells.get(shellId);

  if (shell) {
    if (shell instanceof SSHShell) {
      console.log(" Writing into the ssh")
      shell.write(rawCommand);
    } else {
      shell.stdin.write(rawCommand + "\n");
    }

    res.status(200).json({
      message: "Command executed",
      threadId: shellId,
      command: rawCommand,
    });
    return;
  }

  // Cap the number of concurrent shells at 10
  if (shells.length() >= 10 && !shells.get(shellId)) {
    return res.status(503).json({ message: "Server busy" });
  }

  res.status(200).json({
    message: "Command executed",
    threadId: shellId,
    command: rawCommand,
  });

  if (!shellId) {
    shellId = uuidv4();
  }

  if (command.base === "ssh") {
    createSSHShell(shellId, command as SSHCommand);
    return;
  }

  startChildProcess(shellId, rawCommand);
}

export function registerCommandRoutes(app: any) {
  // app.use("/command", checkAuth);
  app.post("/command", command);
}
