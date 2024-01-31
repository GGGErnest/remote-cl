import { Request, Response, NextFunction } from "express";
import { getDB } from "./database.js";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { WSAuthErrorMessage, WSInputMessage } from "../types/ws-types.js";
import { broadcast } from "../ws-server.js";

const { sign, verify } = jwt;

const tokenExpirationTime = "1m";

// Middleware for checking if user is authenticated
export function checkReqAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  const accessTokenSecret = getDB()
    .chain.get("authentication")
    .value().privateKey;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    verify(token, accessTokenSecret, (err: VerifyErrors | null, user) => {
      if (err?.name === "TokenExpiredError") {
        return res.status(403).json({ message: "TokenExpiredError" });
      }

      if (err?.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "JsonWebTokenError" });
      }

      if (err) {
        res.sendStatus(403);
      }

      next();
    });
  } else {
    res.sendStatus(401).json({ message: "NoAuthenticationToken" });
  }
}

export function checkWSAuthentication(message: WSInputMessage): boolean {
  const { accessToken } = message;
  const accessTokenSecret = getDB()
    .chain.get("authentication")
    .value().privateKey;

  if (accessToken) {
    try {
      verify(accessToken, accessTokenSecret);
      return true;
    } catch (err: any) {
      console.warn("Auth validation result", err);
      const errorMap = {
        TokenExpiredError: "TokenExpired",
        JsonWebTokenError: "JsonWebTokenError",
      };
      const output = (errorMap as any)[err.name] || "";
      broadcast({
        type: "AuthError",
        output,
      } as WSAuthErrorMessage);
    }
  }

  return false;
}

export function refreshAccessToken(req: Request, res: Response) {

  const { token } = req.body;

  if (!token) {
    return res.sendStatus(401);
  }

  const { privateKey, refreshTokenPrivateKey, refreshToken } = getDB()
    .chain.get("authentication")
    .value();

  if (refreshToken !== token) {
    return res.sendStatus(403);
  }

  try {
    const user = verify(token, refreshTokenPrivateKey) as any;

    const accessToken = sign({ username: user.username }, privateKey, {
      expiresIn: tokenExpirationTime,
    });

    res.json({
      message: "Access token was refreshed",
      accessToken,
    });
  } catch (error) {
    return res.sendStatus(403);
  }
}
