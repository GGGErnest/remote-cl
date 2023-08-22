import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import {startWS } from "./ws-server.js";

import { registerAuthRoutes } from "./routes/authentication-routes.js";
import { registerCommandRoutes } from "./routes/command-routes.js";
import { registerShellsRoutes } from "./routes/shells-routes.js";
import { settings } from './state/settings.js';
import { initDB } from "./logic/database.js";
import { registerServersRoutes } from "./routes/servers-routes.js";

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
registerShellsRoutes(app);
registerServersRoutes(app);

app.listen(settings.webServer.port, settings.webServer.host , () => {
  
  console.log(`Server is running on http://${settings.webServer.host}:${settings.webServer.port}`);
  
  startWS();
  //initializing the DB
  initDB()
});

