import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import {startWS } from "./ws-server";

import { registerAuthRoutes } from "./routes/authentication-routes";
import { registerCommandRoutes } from "./routes/command-routes";
import { registerThreadsRoutes } from "./routes/threads-routes";
import { settings } from './state/settings';

declare module "express-session" {
  export interface SessionData {
    token: string;
  }
}

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "my-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1200000, // 20 minutes
    },
  })
);

registerAuthRoutes(app);
registerCommandRoutes(app);
registerThreadsRoutes(app);

app.listen(settings.webServer.port, settings.webServer.host , () => {
  console.log("Server is running on http://localhost:3000");

  startWS();
});

