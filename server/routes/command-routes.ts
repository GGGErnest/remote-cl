import { Request, Response, raw } from "express";
import { broadcast } from "../ws-server";
import { checkAuth } from "./authentication-routes";
import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { shells } from "../state/shells";
import { WSOutMessage } from "../types/ws-types";
import { homedir } from "os";
import { CommandProcessor } from "../logic/command-processor";
import { Command, SSHCommand, isSSHCommand } from "../types/command-types";
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

function createSSHShell(shellId: string, command: Command) {
  let connectionConf:ConnectConfig;

  if(isSSHCommand(command)) {
    connectionConf = {
      host:command.server,
      username:command.user,
      password: command.password,
      port:command.port ?? 22
    };
  } else {
    connectionConf = {
      host: settings.ssh.host,
      username:settings.ssh.username,
      password: settings.ssh.password,
      port:settings.ssh.port
    };
  }
  console.log('Connection info ', connectionConf);
  const shell = new SSHShell(shellId,connectionConf);
  shells.add(shellId, shell);
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
    shell.write(rawCommand);
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

  createSSHShell(shellId, command);
}

export function registerCommandRoutes(app: any) {
  // app.use("/command", checkAuth);
  app.post("/command", command);
}
