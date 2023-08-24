import { Request, Response } from "express";
import { checkAuth } from "./authentication-routes.js";
import { shellsStorage } from "../state/shells.js";

function getShells(req: Request, res: Response) {
   // Return a list of all running threadIds
   res.status(200).json({ message: "All threads", result: shellsStorage.getIds() });
  }

function deleteShell(req: Request, res: Response) {
    const threadId = req.params.threadId;
  
    // Special case: if threadId is "all", terminate all threads
    if (threadId === "all") {
      const shellIds = shellsStorage.getIds();
      for (let threadId in shellIds) {
        shellsStorage.remove(threadId);
      }
      res.status(200).json({ message: "All threads terminated" });
    } else if (shellsStorage.get(threadId)) {
      shellsStorage.remove(threadId);

      res
        .status(200)
        .json({ message: `Thread ${threadId} terminated`, result: [threadId] });
    } else {
      res.status(404).json({ message: `Thread ${threadId} not found` });
    }
}

function getShellHistory(req: Request, res: Response) {
  const shellData = shellsStorage.get(req.params.id);
  if(shellData) {
    return res.status(200).json({ message: "Shell history", result: shellData.getHistory() });
  }

  return res.status(400).json({message:'Shell not found', result:undefined});
}

export function registerShellsRoutes(app: any) {
    // app.use("/threads", checkAuth);
    // app.use("/thread/:threadId", checkAuth);

    app.get("/shells", getShells);
    app.get("/shells/:id/history", getShellHistory);
    app.delete("/shells/:id", deleteShell);

  }
  