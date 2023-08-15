import { Request, Response } from "express";
import { checkAuth } from "./authentication-routes";
import { shells } from "../state/shells";

function threads(req: Request, res: Response) {
   // Return a list of all running threadIds
   res.status(200).json({ message: "All threads", result: shells.getIds() });
  }

function threadsDelete(req: Request, res: Response) {
    const threadId = req.params.threadId;
  
    // Special case: if threadId is "all", terminate all threads
    if (threadId === "all") {
      const shellIds = shells.getIds();
      for (let threadId in shellIds) {
        shells.remove(threadId);
      }
      res.status(200).json({ message: "All threads terminated" });
    } else if (shells.get(threadId)) {
      shells.remove(threadId);

      res
        .status(200)
        .json({ message: `Thread ${threadId} terminated`, result: [threadId] });
    } else {
      res.status(404).json({ message: `Thread ${threadId} not found` });
    }
}

export function registerThreadsRoutes(app: any) {
    // app.use("/threads", checkAuth);
    // app.use("/thread/:threadId", checkAuth);

    app.get("/threads", threads);
    app.delete("/thread/:threadId", threadsDelete);

  }
  