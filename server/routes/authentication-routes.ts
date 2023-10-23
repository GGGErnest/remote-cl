import { Request, Response, NextFunction, Express } from "express";
import { getDB } from "../logic/database.js";
import jwt, { VerifyErrors } from "jsonwebtoken";

const { sign, verify } = jwt;

const tokenExpirationTime = "1m";
// Middleware for checking if user is authenticated
export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  const accessTokenSecret = getDB().chain.get("authentication").value().secret;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    verify(token, accessTokenSecret, (err: VerifyErrors | null, user) => {
      if (err?.name === 'TokenExpiredError' ) {
        return res.status(403).json({ message: "TokenExpiredError" });
      }

      if(err?.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: "JsonWebTokenError" });
      }

      if(err) {
        res.sendStatus(403);
      }

      next();
    });
  } else {
    res.sendStatus(401).json({ message: "NoAuthenticationToken" });
  }
};

function logout(req: Request, res: Response) {
  const { token } = req.body;
  let authentication = getDB().chain.get("authentication").value();
  authentication.refreshTokens = authentication.refreshTokens.filter(
    (item) => item !== token
  );
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
      .refreshTokens.push(userRefreshToken);
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

function refreshAccessToken(req: Request, res: Response) {
  console.warn("Refresh Token endpoint was called");
  const { token } = req.body;
  const accessTokenSecret = getDB().chain.get("authentication").value().secret;

  if (!token) {
    return res.sendStatus(401);
  }

  const refreshTokens = getDB()
    .chain.get("authentication")
    .value().refreshTokens;

  if (!refreshTokens.includes(token)) {
    return res.sendStatus(403);
  }

  const refreshTokenSecret = getDB()
    .chain.get("authentication")
    .value().refreshAuthToken;

  verify(
    token,
    refreshTokenSecret,
    (errors: VerifyErrors | null, user: any) => {
      if (errors) {
        return res.sendStatus(403);
      }

      const accessToken = sign({ username: user.username }, accessTokenSecret, {
        expiresIn: tokenExpirationTime,
      });

      res.json({
        message: "Access token was refreshed",
        accessToken,
      });
    }
  );
}

export function registerAuthRoutes(app: Express) {
  app.use("/userLogin", checkAuth);
  app.use("/token", refreshAccessToken);

  app.post("/logout", logout);
  app.post("/login", login);
  app.get("/userLogin", userLogin);
}
