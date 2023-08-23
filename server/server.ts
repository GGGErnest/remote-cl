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

const corsOptions = {
  origin: '*', // replace [DOCKER_HOST_IP] with the actual IP
  optionsSuccessStatus: 200
}

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

app.all('/', function(req, res, next) {
  console.log("We got a request")
  next();
 });

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
  
  startWS(settings.wsServer.host,settings.wsServer.port);
  //initializing the DB
  initDB()
});

