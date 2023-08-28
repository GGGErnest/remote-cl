import { Request, Response, raw } from "express";
import { broadcast } from "../ws-server.js";
import { checkAuth } from "./authentication-routes.js";
import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { terminalsStorage } from "../state/shells.js";
import { WSOutputMessage } from "../types/ws-types.js";
import { homedir } from "os";
import { CommandProcessor } from "../logic/command-processor.js";
import { Command, SSHCommand, isSSHCommand } from "../types/command-types.js";
import {
  Client,
  ConnectConfig,
  KeyboardInteractiveAuthMethod,
  PasswordAuthMethod,
  PublicKeyAuthMethod,
} from "ssh2";
import { settings } from "../state/settings.js";
import { SSHShell } from "../logic/ssh-shell.js";

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
  terminalsStorage.add(shellId, shell);
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

  let shell = terminalsStorage.get(shellId);

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
  if (terminalsStorage.length() >= 10 && !terminalsStorage.get(shellId)) {
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
