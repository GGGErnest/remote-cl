import { Request, Response, NextFunction, Express } from "express";
import { getDB } from "../logic/database.js";
import jwt from "jsonwebtoken";
import { checkReqAuth, refreshAccessToken } from "../logic/authentication.js";

const { sign, verify } = jwt;

const tokenExpirationTime = "10m";

function logout(req: Request, res: Response) {
  let authentication = getDB().chain.get("authentication").value();
  authentication.refreshToken = '';
  getDB().write();
  return res
    .status(200)
    .json({ message: "Logged out successfully", result: true });
}

function login(req: Request, res: Response) {
  const accessTokenSecret = getDB().chain.get("authentication").value().secret;
  const { user, password } = req.body;
  const adminUser = getDB().chain.get("users").value().admin.username;
  const adminPassword = getDB().chain.get("users").value().admin.password;

  const refreshTokenSecret = getDB()
    .chain.get("authentication")
    .value().refreshAuthToken;

  if (user === adminUser && password === adminPassword) {
    const userAccessToken = sign({ username: user }, accessTokenSecret, {
      expiresIn: tokenExpirationTime,
    });
    const userRefreshToken = sign({ username: user }, refreshTokenSecret);
    getDB()
      .chain.get("authentication")
      .value()
      .refreshToken = userRefreshToken;

    getDB().write();

    res
      .status(200)
      .json({
        message: "Logged in successfully",
        accessToken: userAccessToken,
        refreshToken: userRefreshToken,
        result: true,
      });
  } else {
    res.status(401).json({ message: "Incorrect password", result: false });
  }
}

function userLogin(req: Request, res: Response) {
  res.status(200).json({ message: "User is in", result: true });
}

export function registerAuthRoutes(app: Express) {
  app.use("/userLogin", checkReqAuth);
  app.use("/token", refreshAccessToken);

  app.post("/logout", logout);
  app.post("/login", login);
  app.get("/userLogin", userLogin);
}
